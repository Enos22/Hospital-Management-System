from datetime import datetime, timedelta

from app.shared.extensions import db
from app.benson.models import Invoice, InvoiceItem, Payment, Patient

PAYMENT_METHODS = ["cash", "card", "mobile_money", "bank_transfer", "insurance"]


def get_status(total, paid):
    # status depends on how much has been paid
    if paid <= 0:
        return "unpaid"
    elif paid < total:
        return "partial"
    else:
        return "paid"


def invoice_to_dict(invoice):
    items = []
    for item in invoice.items:
        items.append({
            "description": item.description,
            "quantity": item.quantity,
            "unit_price": item.unit_price,
            "line_total": item.line_total,
        })

    payments = []
    for p in invoice.payments:
        payments.append({
            "id": p.id,
            "amount": p.amount,
            "method": p.method,
            "reference": p.reference,
            "paid_at": str(p.paid_at),
        })

    return {
        "id": invoice.id,
        "invoice_number": invoice.invoice_number,
        "patient_id": invoice.patient_id,
        "subtotal": invoice.subtotal,
        "tax_amount": invoice.tax_amount,
        "discount_amount": invoice.discount_amount,
        "total_amount": invoice.total_amount,
        "amount_paid": invoice.amount_paid,
        "balance": round(invoice.total_amount - invoice.amount_paid, 2),
        "status": invoice.status,
        "issued_at": str(invoice.issued_at),
        "due_date": str(invoice.due_date),
        "items": items,
        "payments": payments,
    }


def create_invoice(patient_id, items, tax_rate, discount, created_by):
    # check the patient exists
    patient = Patient.query.get(patient_id)
    if patient is None:
        raise LookupError("Patient not found")

    if not items:
        raise ValueError("Add at least one item")

    # add up the items
    subtotal = 0
    clean_items = []
    for item in items:
        description = item.get("description")
        quantity = item.get("quantity", 1)
        price = item.get("unit_price")

        if not description:
            raise ValueError("Each item needs a description")
        if not isinstance(quantity, int) or quantity < 1:
            raise ValueError("Quantity must be a whole number of 1 or more")
        if not isinstance(price, (int, float)) or price < 0:
            raise ValueError("Unit price must be a number that is not negative")

        line_total = round(quantity * price, 2)
        subtotal = subtotal + line_total
        clean_items.append({
            "description": description,
            "quantity": quantity,
            "unit_price": price,
            "line_total": line_total,
        })

    # tax and discount
    if tax_rate < 0 or tax_rate > 100:
        raise ValueError("Tax rate must be between 0 and 100")
    tax = round(subtotal * tax_rate / 100, 2)

    if discount < 0 or discount > subtotal + tax:
        raise ValueError("Discount is not valid")

    total = round(subtotal + tax - discount, 2)

    # save the invoice
    invoice = Invoice(
        patient_id=patient_id,
        subtotal=round(subtotal, 2),
        tax_amount=tax,
        discount_amount=discount,
        total_amount=total,
        amount_paid=0,
        status="unpaid",
        issued_at=datetime.utcnow(),
        due_date=(datetime.utcnow() + timedelta(days=30)).date(),
        created_by=created_by,
    )
    db.session.add(invoice)
    db.session.commit()          # now the invoice has an id

    # make the invoice number from the id
    invoice.invoice_number = "INV-" + str(invoice.id).zfill(6)

    for item in clean_items:
        db.session.add(InvoiceItem(invoice_id=invoice.id, **item))
    db.session.commit()

    return invoice_to_dict(invoice)


def get_invoice(invoice_id):
    invoice = Invoice.query.get(invoice_id)
    if invoice is None:
        raise LookupError("Invoice not found")
    return invoice


def list_invoices(patient_id=None, status=None):
    query = Invoice.query
    if patient_id:
        query = query.filter_by(patient_id=patient_id)
    if status:
        query = query.filter_by(status=status)

    invoices = query.order_by(Invoice.issued_at.desc()).all()
    return [invoice_to_dict(i) for i in invoices]


def cancel_invoice(invoice_id):
    invoice = get_invoice(invoice_id)

    if invoice.status == "cancelled":
        raise ValueError("Invoice is already cancelled")
    if invoice.amount_paid > 0:
        raise ValueError("Invoice already has payments so it cannot be cancelled")

    invoice.status = "cancelled"
    db.session.commit()
    return invoice_to_dict(invoice)


def record_payment(invoice_id, amount, method, reference, received_by):
    invoice = get_invoice(invoice_id)

    if invoice.status == "cancelled":
        raise ValueError("Cannot pay a cancelled invoice")
    if not isinstance(amount, (int, float)) or amount <= 0:
        raise ValueError("Amount must be more than 0")
    if method not in PAYMENT_METHODS:
        raise ValueError("Method must be one of: " + ", ".join(PAYMENT_METHODS))

    balance = round(invoice.total_amount - invoice.amount_paid, 2)
    if balance <= 0:
        raise ValueError("Invoice is already fully paid")
    if amount > balance:
        raise ValueError("Amount is more than the balance of " + str(balance))

    payment = Payment(
        invoice_id=invoice.id,
        amount=amount,
        method=method,
        reference=reference,
        paid_at=datetime.utcnow(),
        received_by=received_by,
    )
    db.session.add(payment)

    # update the invoice
    invoice.amount_paid = round(invoice.amount_paid + amount, 2)
    invoice.status = get_status(invoice.total_amount, invoice.amount_paid)
    db.session.commit()

    return invoice_to_dict(invoice)


def get_patient_balance(patient_id):
    if Patient.query.get(patient_id) is None:
        raise LookupError("Patient not found")

    invoices = Invoice.query.filter_by(patient_id=patient_id).all()
    owed = 0
    for inv in invoices:
        if inv.status in ["unpaid", "partial"]:
            owed = owed + (inv.total_amount - inv.amount_paid)

    return {"patient_id": patient_id, "outstanding_balance": round(owed, 2)}


def list_outstanding():
    invoices = Invoice.query.filter(Invoice.status.in_(["unpaid", "partial"])).all()

    result = []
    total = 0
    for inv in invoices:
        total = total + (inv.total_amount - inv.amount_paid)
        result.append(invoice_to_dict(inv))

    return {"invoices": result, "total_outstanding": round(total, 2)}