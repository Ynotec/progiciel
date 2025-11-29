export default interface Product {
    id: number;
    name: string;
    list_price: number;
    type: string;
    default_code: string | null;
    categ_id: [number, string] | null;
    qty_available: number;
    number_of_bed: number;
    number_of_bedrooms: number;
    number_of_bathrooms: number;
    product_variant_id: [number, string] | null;
    street: string;
    number_house: string;
    postal_code: string;
    image_1920: string | null;
}
