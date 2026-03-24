export type EventType = 'order.created' | 'order.status_updated' | 'order.cancelled' | 'order.fulfilled' | 'user.created' | 'user.profile_updated' | 'user.deleted' | 'payment.initiated' | 'payment.succeeded' | 'payment.failed' | 'payment.refunded' | 'cart.checked_out' | 'inventory.reserved' | 'inventory.released';
export type EventSource = 'komodo-auth-api' | 'komodo-user-api' | 'komodo-order-api' | 'komodo-cart-api' | 'komodo-inventory-api' | 'komodo-payments-api' | 'komodo-shop-items-api' | 'komodo-communications-api';
export type EntityType = 'order' | 'user' | 'payment' | 'cart' | 'inventory' | 'product';
export interface KomodoEvent<T = Record<string, unknown>> {
    id: string;
    type: EventType;
    source: EventSource;
    entity_id: string;
    entity_type: EntityType;
    /** ISO 8601 UTC timestamp */
    occurred_at: string;
    version: string;
    payload: T;
    /** Traces the event chain back to the originating HTTP request. */
    correlation_id?: string;
}
//# sourceMappingURL=index.d.ts.map