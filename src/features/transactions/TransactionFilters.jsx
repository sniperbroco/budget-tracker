import { DateRangePicker } from '../../components/DateRangePicker'
import { Select } from '../../components/Select'
import { Icon } from '../../components/Icon'

export function TransactionFilters({ filters, categories, accounts, onChange }) {
  return (
    <div className="filters">
      <div className="field search-field">
        <span className="field-label">Search</span>
        <div className="search-input">
          <Icon name="search" size={16} />
          <input
            className="field-control"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Notes or tags…"
          />
        </div>
      </div>
      <DateRangePicker
        from={filters.dateFrom}
        to={filters.dateTo}
        onFromChange={(value) => onChange({ ...filters, dateFrom: value })}
        onToChange={(value) => onChange({ ...filters, dateTo: value })}
      />
      <Select label="Type" value={filters.type} onChange={(e) => onChange({ ...filters, type: e.target.value })}>
        <option value="">All types</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </Select>
      <Select
        label="Category"
        value={filters.categoryId}
        onChange={(e) => onChange({ ...filters, categoryId: e.target.value })}
      >
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>{category.name}</option>
        ))}
      </Select>
      {accounts.length > 0 && (
        <Select
          label="Account"
          value={filters.accountId}
          onChange={(e) => onChange({ ...filters, accountId: e.target.value })}
        >
          <option value="">All accounts</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>{account.name}</option>
          ))}
        </Select>
      )}
    </div>
  )
}
