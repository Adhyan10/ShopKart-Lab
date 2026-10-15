const FIELDS = [
  { name: "fullName", label: "Full Name", type: "text", autoComplete: "name" },
  { name: "phone", label: "Phone", type: "tel", autoComplete: "tel" },
  { name: "addressLine1", label: "Address", type: "text", autoComplete: "street-address" },
  { name: "city", label: "City", type: "text", autoComplete: "address-level2" },
  { name: "state", label: "State", type: "text", autoComplete: "address-level1" },
  { name: "pincode", label: "Pincode", type: "text", autoComplete: "postal-code", inputMode: "numeric" },
];

// Controlled form: state lives in Checkout, this only renders fields and errors
function CheckoutForm({ address, errors, disabled, onChange }) {
  return (
    <fieldset className="shipping-form" disabled={disabled}>
      <legend>Shipping Details</legend>
      {FIELDS.map(({ name, label, ...inputProps }) => (
        <div className="form-row" key={name}>
          <label htmlFor={name}>{label}</label>
          <input
            id={name}
            name={name}
            value={address[name]}
            onChange={onChange}
            aria-invalid={Boolean(errors[name])}
            aria-describedby={errors[name] ? `${name}-error` : undefined}
            {...inputProps}
          />
          {errors[name] && <p className="field-error" id={`${name}-error`}>{errors[name]}</p>}
        </div>
      ))}
    </fieldset>
  );
}

export default CheckoutForm;
