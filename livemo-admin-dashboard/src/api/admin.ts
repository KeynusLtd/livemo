import { API_BASE_URL, apiRequest } from './client';

export type AdminStats = {
    total_users: number;
    active_listings: number;
    total_orders: number;
    revenue: number;
    recent_users: Array<{ id: number; name: string; email: string }>;
    pending_listings: number;
};

export type RefundRequest = {
    id: number;
    order_id: number;
    order?: AdminOrder;
    requested_by_user_id: number | null;
    requestedBy?: { id: number; name?: string; email?: string } | null;
    processed_by_admin_id?: number | null;
    processedBy?: { id: number; name?: string; email?: string } | null;
    amount: number;
    currency: string;
    reason: string;
    details?: string | null;
    status: 'requested' | 'approved' | 'rejected' | 'processed';
    processed_at?: string | null;
    created_at: string;
    updated_at?: string;
};

export type AdminAnimalCatalog = {
    id: number;
    name: string;
    type: 'cattle' | 'goats' | 'sheep' | 'poultry' | 'swine' | 'horses' | 'rabbits';
    breed?: string | null;
    default_gender?: 'male' | 'female' | null;
    is_active: boolean;
    metadata?: unknown;
    created_by?: number | null;
    created_at: string;
    updated_at?: string;
};

export type EscrowTransaction = {
    id: number;
    order_id: number;
    order?: AdminOrder;
    seller_id: number;
    seller?: { id: number; name?: string; email?: string } | null;
    amount: number;
    currency: string;
    type: 'hold' | 'release' | 'refund';
    status: string;
    notes?: string | null;
    processed_by_admin_id?: number | null;
    processedBy?: { id: number; name?: string; email?: string } | null;
    created_at: string;
    updated_at?: string;
};

export type AdminOrder = {
    id: number;
    status: string;
    payment_status?: string;
    total: number;
    currency?: string;
    created_at: string;
    buyer?: { id: number; name?: string; email?: string } | null;
    seller?: { id: number; name?: string; email?: string } | null;
};

export type AdminPayout = {
    id: number;
    seller_id: number;
    seller?: { id: number; name?: string; email?: string } | null;
    requested_by_admin_id: number;
    requestedBy?: { id: number; name?: string; email?: string } | null;
    amount: number;
    currency: string;
    status: 'requested' | 'processing' | 'paid' | 'failed' | 'cancelled';
    notes?: string | null;
    processed_at?: string | null;
    created_at: string;
    updated_at?: string;
};

export type AdminSettings = {
    commission_rate: number;
    site_name: string;
    maintenance_mode: boolean;
    [key: string]: unknown;
};

export type AdminCategory = {
    id: number;
    parent_id: number | null;
    name: string;
    slug: string;
    description?: string | null;
    icon?: string | null;
    type: 'product' | 'service';
    order: number;
    is_active: boolean;
    created_at: string;
    updated_at?: string;
};

export type AdminHealth = {
    status: string;
    timestamp: string;
    database: { ok: boolean; error: string | null };
};

export type AdminFinanceSummary = {
    range: { from: string; to: string };
    orders_count: number;
    revenue_total: number;
    commission_rate: number;
    estimated_commission_total: number;
    payouts_total: number;
};

export type RevenueTrendPoint = {
    day: string;
    revenue: number;
};

export type RevenueTrend = {
    days: number;
    points: RevenueTrendPoint[];
};

export type UserGrowthPoint = {
    day: string;
    count: number;
};

export type UserGrowth = {
    days: number;
    points: UserGrowthPoint[];
};

export type MarketplaceActivityListingPoint = {
    day: string;
    listings_created: number;
};

export type MarketplaceActivityOrderPoint = {
    day: string;
    orders_completed: number;
    revenue: number;
};

export type MarketplaceActivity = {
    days: number;
    listings: MarketplaceActivityListingPoint[];
    orders: MarketplaceActivityOrderPoint[];
};

export type AuditLog = {
    id: number;
    action: string;
    entity_type: string | null;
    entity_id: number | null;
    admin_id: number | null;
    ip_address: string | null;
    created_at: string;
};

export type AdminListing = {
    id: number;
    title: string;
    description?: string;
    status: string;
    price?: number;
    currency?: string;
    type?: string;
    featured?: boolean;
    location?: string;
    seller?: { id: number; name?: string; email?: string };
    created_at: string;
    updated_at?: string;
};

export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

export type AdminUser = {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    role: string;
    status: string;
    is_verified: boolean;
    verified_at?: string | null;
    created_at: string;
    updated_at?: string;
};

export type UserActivity = {
    user: AdminUser;
    recent: {
        listings: Array<{ id: number; title?: string; status?: string; created_at?: string }>;
        purchases: Array<{ id: number; status?: string; total_amount?: number; created_at?: string }>;
        sales: Array<{ id: number; status?: string; total_amount?: number; created_at?: string }>;
        conversations: Array<{ id: number; listing_id?: number; last_message_at?: string }>;
    };
    counts: Record<string, number>;
};

export function getAdminStats(token: string) {
    return apiRequest<AdminStats>('/admin/stats', { method: 'GET', token });
}

export function getAdminHealth(token: string) {
    return apiRequest<AdminHealth>('/admin/health', { method: 'GET', token });
}

export function getAdminFinanceSummary(token: string, params?: { from?: string; to?: string }) {
    const search = params
        ? `?${new URLSearchParams(
            Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null)) as Record<string, string>,
        ).toString()}`
        : '';
    return apiRequest<AdminFinanceSummary>(`/admin/finance/summary${search}`, { method: 'GET', token });
}

export function getAdminRevenueTrend(token: string, days = 30) {
    return apiRequest<RevenueTrend>(`/admin/finance/revenue-trend?days=${days}`, { method: 'GET', token });
}

export function getAdminUserGrowth(token: string, days = 30) {
    return apiRequest<UserGrowth>(`/admin/analytics/user-growth?days=${days}`, { method: 'GET', token });
}

export function getAdminMarketplaceActivity(token: string, days = 30) {
    return apiRequest<MarketplaceActivity>(`/admin/analytics/marketplace-activity?days=${days}`, { method: 'GET', token });
}

export function getAdminAuditLogs(
    token: string,
    params: {
        page?: number;
        limit?: number;
        admin_id?: number;
        entity_type?: string;
        entity_id?: number;
        action?: string;
        q?: string;
    } = {},
) {
    const query = new URLSearchParams();
    const { limit, ...rest } = params;
    if (limit) {
        query.set('per_page', String(limit));
    }
    Object.entries(rest).forEach(([key, value]) => {
        if (value != null && value !== '') {
            query.set(key, String(value));
        }
    });

    if (!query.has('page')) {
        query.set('page', '1');
    }

    const suffix = query.toString() ? `?${query.toString()}` : '';
    return apiRequest<Paginated<AuditLog>>(`/admin/audit-logs${suffix}`, { method: 'GET', token });
}

export function getAdminUsers(
    token: string,
    params: { page?: number; role?: string; status?: string; search?: string; verification?: 'pending' | 'verified' } = {},
) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value != null && value !== '' && value !== 'all') {
            query.set(key, String(value));
        }
    });

    const suffix = query.toString() ? `?${query.toString()}` : '';
    return apiRequest<Paginated<AdminUser>>(`/admin/users${suffix}`, { method: 'GET', token });
}

export function updateAdminUserStatus(
    token: string,
    id: number,
    payload: Partial<Pick<AdminUser, 'status' | 'is_verified'>>,
) {
    return apiRequest<{ message: string; user: AdminUser }>(`/admin/users/${id}/status`, {
        method: 'PUT',
        token,
        body: JSON.stringify(payload),
    });
}

export function deleteAdminUser(token: string, id: number) {
    return apiRequest<{ message: string }>(`/admin/users/${id}`, { method: 'DELETE', token });
}

export function getAdminUserActivity(token: string, id: number) {
    return apiRequest<UserActivity>(`/admin/users/${id}/activity`, { method: 'GET', token });
}

export function getAdminListings(
    token: string,
    params: { page?: number; status?: string; search?: string; type?: string } = {},
) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value != null && value !== '' && value !== 'all') {
            query.set(key, String(value));
        }
    });

    const suffix = query.toString() ? `?${query.toString()}` : '';
    return apiRequest<Paginated<AdminListing>>(`/admin/listings${suffix}`, { method: 'GET', token });
}

export function updateAdminListingStatus(token: string, id: number, status: string) {
    return apiRequest<{ message: string; listing: AdminListing }>(`/admin/listings/${id}/status`, {
        method: 'PUT',
        token,
        body: JSON.stringify({ status }),
    });
}

export function updateAdminListingFeature(token: string, id: number, featured: boolean) {
    return apiRequest<{ message: string; listing: AdminListing }>(`/admin/listings/${id}/feature`, {
        method: 'PUT',
        token,
        body: JSON.stringify({ featured }),
    });
}

export function deleteAdminListing(token: string, id: number) {
    return apiRequest<{ message: string }>(`/admin/listings/${id}`, { method: 'DELETE', token });
}

export function getAdminCategories(
    token: string,
    params: { page?: number; type?: 'product' | 'service' | 'all'; is_active?: string; search?: string } = {},
) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value != null && value !== '' && value !== 'all') {
            query.set(key, String(value));
        }
    });

    const suffix = query.toString() ? `?${query.toString()}` : '';
    return apiRequest<Paginated<AdminCategory>>(`/admin/categories${suffix}`, { method: 'GET', token });
}

export function createAdminCategory(token: string, payload: Partial<AdminCategory>) {
    return apiRequest<{ message: string; category: AdminCategory }>(`/admin/categories`, {
        method: 'POST',
        token,
        body: JSON.stringify(payload),
    });
}

export function updateAdminCategory(token: string, id: number, payload: Partial<AdminCategory>) {
    return apiRequest<{ message: string; category: AdminCategory }>(`/admin/categories/${id}`, {
        method: 'PUT',
        token,
        body: JSON.stringify(payload),
    });
}

export function deleteAdminCategory(token: string, id: number) {
    return apiRequest<{ message: string }>(`/admin/categories/${id}`, { method: 'DELETE', token });
}

export function getAdminAnimalCatalogs(
    token: string,
    params: { page?: number; per_page?: number; type?: string; is_active?: string; search?: string } = {},
) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value != null && value !== '' && value !== 'all') {
            query.set(key, String(value));
        }
    });

    const suffix = query.toString() ? `?${query.toString()}` : '';
    return apiRequest<Paginated<AdminAnimalCatalog>>(`/admin/animal-catalogs${suffix}`, { method: 'GET', token });
}

export function createAdminAnimalCatalog(token: string, payload: Partial<AdminAnimalCatalog>) {
    return apiRequest<{ message: string; item: AdminAnimalCatalog }>(`/admin/animal-catalogs`, {
        method: 'POST',
        token,
        body: JSON.stringify(payload),
    });
}

export function updateAdminAnimalCatalog(token: string, id: number, payload: Partial<AdminAnimalCatalog>) {
    return apiRequest<{ message: string; item: AdminAnimalCatalog }>(`/admin/animal-catalogs/${id}`, {
        method: 'PUT',
        token,
        body: JSON.stringify(payload),
    });
}

export function deleteAdminAnimalCatalog(token: string, id: number) {
    return apiRequest<{ message: string }>(`/admin/animal-catalogs/${id}`, { method: 'DELETE', token });
}

export function getAdminTransactions(token: string, params: { page?: number } = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value != null) {
            query.set(key, String(value));
        }
    });
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return apiRequest<Paginated<AdminOrder>>(`/admin/transactions${suffix}`, { method: 'GET', token });
}

export function buildAdminTransactionsExportCsvUrl(params: { from?: string; to?: string } = {}) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value != null && value !== '') {
            search.set(key, String(value));
        }
    });
    const suffix = search.toString() ? `?${search.toString()}` : '';
    return `${API_BASE_URL}/admin/transactions/export/csv${suffix}`;
}

export function getAdminPayouts(
    token: string,
    params: { page?: number; status?: string; seller_id?: number } = {},
) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value != null && value !== '') {
            query.set(key, String(value));
        }
    });
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return apiRequest<Paginated<AdminPayout>>(`/admin/payouts${suffix}`, { method: 'GET', token });
}

export function createAdminPayout(token: string, payload: { seller_id: number; amount: number; currency?: string; notes?: string }) {
    return apiRequest<{ message: string; payout: AdminPayout }>(`/admin/payouts`, {
        method: 'POST',
        token,
        body: JSON.stringify(payload),
    });
}

export function updateAdminPayoutStatus(
    token: string,
    id: number,
    payload: { status: AdminPayout['status']; notes?: string },
) {
    return apiRequest<{ message: string; payout: AdminPayout }>(`/admin/payouts/${id}/status`, {
        method: 'PUT',
        token,
        body: JSON.stringify(payload),
    });
}

export function getAdminSettingsApi(token: string) {
    return apiRequest<AdminSettings>('/admin/settings', { method: 'GET', token });
}

export function updateAdminSettings(token: string, payload: Partial<AdminSettings>) {
    return apiRequest<{ message: string }>(`/admin/settings`, {
        method: 'PUT',
        token,
        body: JSON.stringify(payload),
    });
}

export function getAdminRefunds(
    token: string,
    params: { page?: number; status?: RefundRequest['status'] } = {},
) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value != null && String(value) !== '') {
            query.set(key, String(value));
        }
    });
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return apiRequest<Paginated<RefundRequest>>(`/admin/finance/refunds${suffix}`, { method: 'GET', token });
}

export function updateAdminRefundStatus(
    token: string,
    id: number,
    payload: { status: RefundRequest['status']; details?: string },
) {
    return apiRequest<{ message: string; refund: RefundRequest }>(`/admin/finance/refunds/${id}/status`, {
        method: 'PUT',
        token,
        body: JSON.stringify(payload),
    });
}

export function getAdminEscrowTransactions(
    token: string,
    params: { page?: number; type?: EscrowTransaction['type'] } = {},
) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value != null && String(value) !== '') {
            query.set(key, String(value));
        }
    });
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return apiRequest<Paginated<EscrowTransaction>>(`/admin/finance/escrow${suffix}`, { method: 'GET', token });
}

export function releaseAdminEscrow(
    token: string,
    payload: { order_id: number; amount: number; currency?: string; notes?: string },
) {
    return apiRequest<{ message: string; transaction: EscrowTransaction }>(`/admin/finance/escrow/release`, {
        method: 'POST',
        token,
        body: JSON.stringify(payload),
    });
}
