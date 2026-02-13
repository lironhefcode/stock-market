declare global {
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
  }

  type Stock = {
    symbol: string
    name: string
    exchange: string
    type: string
  }

  type StockWithWatchlistStatus = Stock & {
    isInWatchlist: boolean
  }

  type FinnhubSearchResult = {
    symbol: string
    description: string
    displaySymbol?: string
    type: string
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
    alertData: Alert[] | undefined
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
    currentPrice: number
    alertType: "upper" | "lower"
    threshold: number
    changePercent?: number
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
}

export {}
