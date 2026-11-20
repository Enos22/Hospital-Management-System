import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button.jsx";
import Input from "../../../components/ui/Input.jsx";

function valuesFor(medicine) {
  return {
    name: medicine?.name ?? "",
    description: medicine?.description ?? "",
    price: medicine?.price ?? "",
    stock_quantity: medicine?.stock_quantity ?? "",
  };
}

export default function MedicineForm({
  medicine = null,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) {
  const [values, setValues] = useState(() => valuesFor(medicine));
  const [formError, setFormError] = useState("");

  useEffect(() => {
    setValues(valuesFor(medicine));
    setFormError("");
  }, [medicine]);

  function updateField(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const name = values.name.trim();
    const price = Number(values.price);
    const stock = Number(values.stock_quantity);

    if (typeof onSubmit !== "function") {
      setFormError("Saving is not available right now.");
      return;
    }
    if (!name) {
      setFormError("Enter a medicine name.");
      return;
    }
    if (values.price === "" || !Number.isFinite(price) || price < 0) {
      setFormError("Price must be a non-negative number.");
      return;
    }
    if (
      values.stock_quantity === "" ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      setFormError("Stock quantity must be a non-negative whole number.");
      return;
    }

    setFormError("");
    try {
      await onSubmit?.({
        name,
        description: values.description.trim(),
        price,
        stock_quantity: stock,
      });
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to save this medicine.",
      );
    }
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit} noValidate>
      <Input
        label="Medicine name"
        name="name"
        value={values.name}
        onChange={updateField}
        required
        maxLength={100}
        autoComplete="off"
      />
      <Input
        label="Description"
        name="description"
        value={values.description}
        onChange={updateField}
        as="textarea"
        rows={3}
      />
      <div className="form-grid">
        <Input
          label="Price (KES)"
          name="price"
          type="number"
          value={values.price}
          onChange={updateField}
          min="0"
          step="0.01"
          required
        />
        <Input
          label="Stock quantity"
          name="stock_quantity"
          type="number"
          value={values.stock_quantity}
          onChange={updateField}
          min="0"
          step="1"
          required
        />
      </div>
      {formError && (
        <p className="form-error" role="alert">
          {formError}
        </p>
      )}
      <div className="form-actions">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" loading={isSubmitting}>
          {medicine ? "Save changes" : "Add medicine"}
        </Button>
      </div>
    </form>
  );
}