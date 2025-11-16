export default interface Product {
    name: string;
    list_price: number;
    type: string;
    default_code: string | null;
    categ_id: [number, string] | null;
    qty_available: number;
}