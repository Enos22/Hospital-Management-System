from datetime import datetime, timedelta
from sqlalchemy import func

from app.models import Invoice, Payment


def get_dates(start, end):
    # dates come in as YYYY-MM-DD. Default is the start of this month until today.
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    try:
        if start:
            start_date = datetime.strptime(start, "%Y-%m-%d")
        else:
            start_date = today.replace(day=1)

        if end:
            end_date = datetime.strptime(end, "%Y-%m-%d") + timedelta(days=1)
        else:
            end_date = today + timedelta(days=1)
    except ValueError:
        raise ValueError("Dates must look like 2026-03-31")

    if start_date >= end_date:
        raise ValueError("Start date must be before end date")

    return start_date, end_date


def revenue_report(start=None, end=None):
    start_date, end_date = get_dates(start, end)

    # invoices made in this period (not cancelled)
    invoices = Invoice.query.filter(
        Invoice.issued_at >= start_date,
        Invoice.issued_at < end_date,
        func.lower(Invoice.status) != "cancelled",
    ).all()

    total_invoiced = 0
    total_outstanding = 0
    for inv in invoices:
        total_invoiced = total_invoiced + inv.total_amount
        if inv.status.lower() in ["unpaid", "partial"]:
            total_outstanding = total_outstanding + (inv.total_amount - inv.amount_paid)

    # payments received in this period
    payment_date = func.coalesce(Payment.paid_at, Payment.created_at)
    payments = Payment.query.filter(
        payment_date >= start_date,
        payment_date < end_date,
    ).all()

    total_collected = 0
    for p in payments:
        total_collected = total_collected + p.amount

    return {
        "start": str(start_date.date()),
        "end": str((end_date - timedelta(days=1)).date()),
        "invoices_issued": len(invoices),
        "total_invoiced": round(total_invoiced, 2),
        "total_collected": round(total_collected, 2),
        "total_outstanding": round(total_outstanding, 2),
    }


def payment_report(start=None, end=None):
    start_date, end_date = get_dates(start, end)

    payment_date = func.coalesce(Payment.paid_at, Payment.created_at)
    payments = Payment.query.filter(
        payment_date >= start_date,
        payment_date < end_date,
    ).all()

    by_method = {}
    total = 0
    for p in payments:
        if p.method not in by_method:
            by_method[p.method] = {"count": 0, "total": 0}
        by_method[p.method]["count"] += 1
        by_method[p.method]["total"] = round(by_method[p.method]["total"] + p.amount, 2)
        total = total + p.amount

    return {
        "number_of_payments": len(payments),
        "total_amount": round(total, 2),
        "by_method": by_method,
    }