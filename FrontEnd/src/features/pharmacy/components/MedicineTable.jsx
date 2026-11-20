import Badge from "../../../components/ui/Badge.jsx";
import Button from "../../../components/ui/Button.jsx";
import EmptyState from "../../../components/feedback/EmptyState.jsx";
import { formatCurrency } from "../../../lib/format/formatCurrency.js";
import { formatDate } from "../../../lib/format/formatDate.js";

function stockVariant(quantity) {
  if (quantity <= 0) return "danger";
  if (quantity <= 10) return "warning";
  return "success";
}

export default function MedicineTable({
  medicines = [],
  canManage = false,
  onEdit,
  onDelete,
  busyMedicineId = null,
}) {
  const showActions = canManage && (onEdit || onDelete);
  if (medicines.length === 0) {
    return (
      <EmptyState
        title="No medicines found"
        description="Try another search or add a medicine to the inventory."
      />
    );
  }

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th scope="col">Medicine</th>
            <th scope="col">Price</th>
            <th scope="col">Stock</th>
            <th scope="col">Updated</th>
            {showActions && (
              <th scope="col">
                <span className="visually-hidden">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {medicines.map((medicine) => {
            const quantity = Number(medicine.stock_quantity) || 0;
            return (
              <tr key={medicine.id}>
                <th scope="row">
                  <span className="table-primary">{medicine.name}</span>
                  {medicine.description && (
                    <span className="table-secondary">{medicine.description}</span>
                  )}
                </th>
                <td>{formatCurrency(medicine.price)}</td>
                <td>
                  <Badge variant={stockVariant(quantity)}>
                    {quantity <= 0
                      ? "Out of stock"
                      : quantity <= 10
                        ? "Low stock"
                        : "In stock"}
                    {" · "}
                    {quantity}
                  </Badge>
                </td>
                <td>{formatDate(medicine.updated_at ?? medicine.created_at)}</td>
                {showActions && (
                  <td>
                    <div className="table-actions">
                      {onEdit && (
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => onEdit(medicine)}
                          disabled={busyMedicineId === medicine.id}
                        >
                          Edit
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="danger"
                          size="small"
                          onClick={() => onDelete(medicine)}
                          disabled={busyMedicineId === medicine.id}
                          aria-label={`Delete ${medicine.name}`}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}