import { CATEGORY_COLORS } from './categoryColors'

export function ColorSwatchPicker({ value, onChange }) {
  return (
    <div className="swatch-picker" role="radiogroup" aria-label="Category color">
      {CATEGORY_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          className={`swatch ${value === color ? 'is-selected' : ''}`.trim()}
          style={{ backgroundColor: color }}
          aria-label={color}
          aria-pressed={value === color}
          onClick={() => onChange(color)}
        />
      ))}
    </div>
  )
}
