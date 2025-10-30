export default function PersonalFinancePrototype() {
  const monthlyItems = [
    { date: 'Mar 24', category: 'Food', account: 'Cash', memo: 'Lunch', amount: '-₩12,000' },
    { date: 'Mar 23', category: 'Salary', account: 'Card', memo: 'Monthly salary', amount: '+₩3,000,000' },
    { date: 'Mar 22', category: 'Transport', account: 'Cash', memo: 'Subway', amount: '-₩1,400' },
    { date: 'Mar 21', category: 'Shopping', account: 'Card', memo: 'Keyboard', amount: '-₩89,000' },
  ]

  const categories = [
    { name: 'Food', type: 'Expense' },
    { name: 'Transport', type: 'Expense' },
    { name: 'Shopping', type: 'Expense' },
    { name: 'Salary', type: 'Income' },
  ]

  const calendarDays = [
    '', '', '', '', '', '1', '2',
    '3', '4', '5', '6', '7', '8', '9',
    '10', '11', '12', '13', '14', '15', '16',
    '17', '18', '19', '20', '21', '22', '23',
    '24', '25', '26', '27', '28', '29', '30',
    '31', '', '', '', '', '', ''
  ]

  const pieLegend = [
    { label: 'Food', value: '42%' },
    { label: 'Shopping', value: '31%' },
    { label: 'Transport', value: '15%' },
    { label: 'Others', value: '12%' },
  ]

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <header className="mb-8 flex flex-col gap-6 rounded-3xl border border-black/10 p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-black/50">Prototype</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Personal Finance Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm text-black/60">
              A black-and-white prototype for a modern personal finance web app focused on monthly transactions,
              summaries, categories, calendar view, and charts.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Total Assets" value="₩2,240,000" />
            <StatCard label="Income" value="₩3,000,000" />
            <StatCard label="Expense" value="₩760,000" />
            <StatCard label="Balance" value="₩2,240,000" />
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <aside className="xl:col-span-3">
            <div className="sticky top-6 space-y-6">
              <section className="rounded-3xl border border-black/10 p-5 shadow-sm">
                <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-black/50">Accounts</h2>
                <div className="mt-4 space-y-3">
                  <AccountRow name="Cash" amount="₩340,000" />
                  <AccountRow name="Card" amount="₩1,900,000" />
                </div>
              </section>

              <section className="rounded-3xl border border-black/10 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium uppercase tracking-[0.18em] text-black/50">Categories</h2>
                  <button className="rounded-full border border-black px-3 py-1 text-xs font-medium hover:bg-black hover:text-white transition">
                    Add
                  </button>
                </div>
                <div className="mt-4 space-y-2">
                  {categories.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between rounded-2xl border border-black/10 px-3 py-2 text-sm"
                    >
                      <span>{item.name}</span>
                      <span className="text-black/50">{item.type}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </aside>

          <main className="xl:col-span-9 space-y-6">
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="rounded-3xl border border-black/10 p-5 shadow-sm lg:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Monthly Transactions</h2>
                    <p className="text-sm text-black/50">March 2026</p>
                  </div>
                  <button className="rounded-full bg-black px-4 py-2 text-sm text-white hover:opacity-90 transition">
                    New Transaction
                  </button>
                </div>

                <div className="mt-5 overflow-hidden rounded-2xl border border-black/10">
                  <div className="grid grid-cols-12 border-b border-black/10 bg-black/[0.03] px-4 py-3 text-xs uppercase tracking-[0.18em] text-black/50">
                    <div className="col-span-2">Date</div>
                    <div className="col-span-3">Category</div>
                    <div className="col-span-2">Account</div>
                    <div className="col-span-3">Memo</div>
                    <div className="col-span-2 text-right">Amount</div>
                  </div>
                  {monthlyItems.map((item, index) => (
                    <div
                      key={`${item.date}-${index}`}
                      className="grid grid-cols-12 items-center px-4 py-4 text-sm border-b border-black/5 last:border-b-0"
                    >
                      <div className="col-span-2">{item.date}</div>
                      <div className="col-span-3">{item.category}</div>
                      <div className="col-span-2">{item.account}</div>
                      <div className="col-span-3 text-black/55">{item.memo}</div>
                      <div className="col-span-2 text-right font-medium">{item.amount}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-black/10 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Monthly Summary</h2>
                    <p className="text-sm text-black/50">March 2026</p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <SummaryRow label="Income" value="₩3,000,000" />
                  <SummaryRow label="Expense" value="₩760,000" />
                  <SummaryRow label="Net Balance" value="₩2,240,000" strong />
                </div>

                <div className="mt-6 rounded-2xl border border-black/10 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-black/50">Quick Note</p>
                  <p className="mt-2 text-sm text-black/65">
                    This month spending is lower than last month. Food and shopping are the largest categories.
                  </p>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-black/10 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Calendar View</h2>
                    <p className="text-sm text-black/50">March 2026</p>
                  </div>
                  <div className="flex gap-2 text-xs text-black/50">
                    <button className="rounded-full border border-black/10 px-3 py-1">Prev</button>
                    <button className="rounded-full border border-black/10 px-3 py-1">Next</button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-[0.15em] text-black/45">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="py-2">{day}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day, index) => {
                    const isHighlighted = day === '21' || day === '23' || day === '24'
                    return (
                      <div
                        key={`${day}-${index}`}
                        className={`min-h-[76px] rounded-2xl border p-2 text-sm ${
                          day
                            ? isHighlighted
                              ? 'border-black bg-black text-white'
                              : 'border-black/10'
                            : 'border-transparent'
                        }`}
                      >
                        <div className="font-medium">{day}</div>
                        {isHighlighted && (
                          <div className="mt-3 text-[10px] opacity-80">
                            {day === '21' && '-₩89k'}
                            {day === '23' && '+₩3.0M'}
                            {day === '24' && '-₩12k'}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl border border-black/10 p-5 shadow-sm">
                  <div>
                    <h2 className="text-lg font-semibold">Expense by Category</h2>
                    <p className="text-sm text-black/50">Prototype chart placeholder</p>
                  </div>

                  <div className="mt-6 flex items-center gap-8">
                    <div className="relative h-44 w-44 shrink-0 rounded-full border border-black/10 bg-[conic-gradient(#000_0_42%,#555_42%_73%,#888_73%_88%,#d4d4d4_88%_100%)]">
                      <div className="absolute inset-5 rounded-full bg-white" />
                    </div>

                    <div className="flex-1 space-y-3">
                      {pieLegend.map((item) => (
                        <div key={item.label} className="flex items-center justify-between rounded-2xl border border-black/10 px-3 py-2 text-sm">
                          <span>{item.label}</span>
                          <span className="font-medium">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-black/10 p-5 shadow-sm">
                  <div>
                    <h2 className="text-lg font-semibold">6-Month Trend</h2>
                    <p className="text-sm text-black/50">Prototype line chart placeholder</p>
                  </div>

                  <div className="mt-6 h-52 rounded-2xl border border-black/10 p-4">
                    <svg viewBox="0 0 400 180" className="h-full w-full">
                      <path d="M20 145 C80 120, 110 90, 150 100 S230 135, 280 80 S350 60, 380 40" fill="none" stroke="black" strokeWidth="3" />
                      <path d="M20 155 C80 150, 120 130, 150 138 S230 145, 280 120 S350 110, 380 98" fill="none" stroke="black" strokeOpacity="0.35" strokeWidth="2" strokeDasharray="6 6" />
                      {[20, 90, 160, 230, 300, 380].map((x, i) => (
                        <circle key={i} cx={x} cy={[145, 115, 103, 128, 72, 40][i]} r="4" fill="black" />
                      ))}
                    </svg>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/10 px-4 py-3 shadow-sm">
      <p className="text-[11px] uppercase tracking-[0.18em] text-black/45">{label}</p>
      <p className="mt-2 text-lg font-semibold tracking-tight">{value}</p>
    </div>
  )
}

function AccountRow({ name, amount }: { name: string; amount: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-black/10 px-4 py-3 text-sm">
      <span>{name}</span>
      <span className="font-medium">{amount}</span>
    </div>
  )
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-2xl border border-black/10 px-4 py-3 text-sm ${strong ? 'bg-black text-white border-black' : ''}`}>
      <span>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
