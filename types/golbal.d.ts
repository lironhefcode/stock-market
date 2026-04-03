declare global {
  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{
      outcome: "accepted" | "dismissed"
      platform: string
    }>
  }

  interface Navigator {
    standalone?: boolean
  }

  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }

  type SignInFormData = {
    email: string
    password: string
  }

  type SignUpFormData = {
    fullName: string
    email: string
    password: string
    country: string
    investmentGoals: string
    riskTolerance: string
    preferredIndustry: string
  }

  type CountrySelectProps = {
    name: string
    label: string
    control: Control
    error?: FieldError
    required?: boolean
  }

  type FormInputProps = {
    name: string
    label: string
    placeholder: string
    type?: string
    register: UseFormRegister
    error?: FieldError
    validation?: RegisterOptions
    disabled?: boolean
    value?: string
    className?: string
  }

  type Option = {
    value: string
    label: string
  }

  type SelectFieldProps = {
    name: string
    label: string
    placeholder: string
    options: readonly Option[]
    control: Control
    error?: FieldError
    required?: boolean
  }

  type FooterLinkProps = {
    text: string
    linkText: string
    href: string
  }

  type SearchCommandProps = {
    watchlistSymbols: string[]
    renderAs?: "button" | "text"
    label?: string
    initialStocks: StockWithWatchlistStatus[]
    quickAdd?: boolean
    onWatchlistChange?: (symbol: string) => void
  }

  type WelcomeEmailData = {
    email: string
    name: string
    intro: string
  }

  type User = {
    id: string
    name: string
    email: string
    country: string
    investmentGoals: string
    riskTolerance: string
    preferredIndustry: string
    receiveDailyEmails: boolean
    showInvestmentToGroup: boolean
  }

  type UpdateUserFormData = {
    country: string
    investmentGoals: string
    riskTolerance: string
    preferredIndustry: string
    receiveDailyEmails: boolean
    showInvestmentToGroup: boolean
  }

  type Stock = {
    symbol: string
    name: string
    exchange: string
  }

  type StockWithWatchlistStatus = Stock & {
    isInWatchlist: boolean
  }

  type FinnhubSearchResult = {
    symbol: string
    description: string
    exchange: string
  }

  type FinnhubSearchResponse = {
    count: number
    result: FinnhubSearchResult[]
  }

  type StockDetailsPageProps = {
    params: Promise<{
      symbol: string
    }>
  }

  type WatchlistButtonProps = {
    symbol: string
    company: string
    isInWatchlist: boolean
    showTrashIcon?: boolean
    type?: "button" | "icon"
    onWatchlistChange?: (symbol: string, isAdded: boolean) => void
  }

  type QuoteData = {
    c?: number
    dp?: number
  }

  type ProfileData = {
    name?: string
    marketCapitalization?: number
  }

  type FinancialsData = {
    metric?: { [key: string]: number }
  }

  type SelectedStock = {
    symbol: string
    company: string
    currentPrice?: number
  }

  type WatchlistTableProps = {
    watchlist: StockWithData[]
  }

  type StockWithData = {
    userId: string
    symbol: string
    company: string
    addedAt: Date
    currentPrice?: number
    changePercent?: number
    priceFormatted?: string
    changeFormatted?: string
    marketCap?: string
    peRatio?: string
  }

  type AlertsListProps = {
    alerts: Alert[]
  }

  type MarketNewsArticle = {
    id: number
    headline: string
    summary: string
    source: string
    url: string
    datetime: number
    category: string
    related: string
    image?: string
  }

  type WatchlistNewsProps = {
    news?: MarketNewsArticle[]
  }

  type SearchCommandProps = {
    open?: boolean
    setOpen?: (open: boolean) => void
    renderAs?: "button" | "text"
    buttonLabel?: string
    buttonVariant?: "primary" | "secondary"
    className?: string
  }

  type AlertData = {
    symbol: string
    company: string
    alertName: string
    alertType: "upper" | "lower"
    threshold: string
    currentPrice: number
  }

  type AlertModalProps = {
    alertId?: string
    alertData?: AlertData
    action?: string
    open: boolean
    setOpen: (open: boolean) => void
  }

  type RawNewsArticle = {
    id: number
    headline?: string
    summary?: string
    source?: string
    url?: string
    datetime?: number
    image?: string
    category?: string
    related?: string
  }

  type Alert = {
    id: string
    symbol: string
    company: string
    alertName: string
    alertType: "upper" | "lower"
    threshold: number
    priceAtCreation: number
    status: "active" | "triggered" | "dismissed"
    lastCheckedPrice?: number | null
    triggeredAt?: string | null
    createdAt: string
  }
  type UserDocument = {
    _id: import("mongodb").ObjectId
    name: string
    email: string
    emailVerified: boolean
    image: string | null
    createdAt: Date
    updatedAt: Date
    receiveDailyEmails: boolean
    showInvestmentToGroup: boolean
    country: string
    investmentGoals: string
    riskTolerance: string
    preferredIndustry: string
  }

  type UserForNewsEmail = {
    id: string
    email: string
    name: string
    country: string
  }

  type GroupResponse = {
    groupId: string
    inviteCode: string
    name: string
  }

  type StockPosition = {
    symbol: string
    amountInvested: number
  }

  type CreateGroupPayload = {
    name: string
    positions: StockPosition[]
  }

  type JoinGroupPayload = {
    inviteCode: string
    positions: StockPosition[]
  }

  type GroupMemberRow = {
    id: string
    groupId: string
    userId: string
    username: string
    positions: StockPosition[]
    totalInvested: number
    todayGain: number
    joinedAt: string | Date
    showInvestment: boolean
  }

  type GroupMembersResponse = {
    members: GroupMemberRow[]
    group: GroupResponse
  }
  type ChatMessage = {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: Date
  }

  type ChatRequest = {
    symbol: string
    messages: ChatMessage[]
  }

  type StockContextData = {
    symbol: string
    companyName: string
    currentPrice: number
    changePercent: number
    marketCap: number
    peRatio: number
    weekHigh52: number
    weekLow52: number
  }
  interface FinnhubProfile {
    country: string
    currency: string
    exchange: string
    name: string
    ticker: string
    ipo: string
    marketCapitalization: number
    shareOutstanding: number
    logo: string
    phone: string
    weburl: string
    finnhubIndustry: string
  }

  // If the symbol is invalid, Finnhub returns an empty object
  type ProfileResponse = FinnhubProfile | Record<string, never>
}
export {}
