import Product from './models/model';
import { authenticate } from '../auth/authenticate';
import { callOdoo } from '../../lib/jsonRpcClient';

let selectedProduct: Product | null = null;
let isSubmitting = false;

function toggleSection(elementId: string, show: boolean, message?: string) {
    const element = document.getElementById(elementId);
    if (!element) {
        return;
    }

    element.classList.toggle('hidden', !show);

    if (message) {
        const paragraph = element.querySelector('p');
        if (paragraph) {
            paragraph.textContent = message;
        }
    }
}

function renderProducts(products: Product[]) {
    const grid = document.getElementById('gridProduct');
    if (!grid) {
        return;
    }

    grid.innerHTML = '';
    products.forEach((product) => {
        const card = createProductCard(product);
        grid.appendChild(card);
    });

    grid.classList.toggle('hidden', products.length === 0);
}

export function displayStats(products: Product[]): void {
    const statsContainer = document.getElementById('areaStats');
    if (!statsContainer) {
        return;
    }

    const totalProducts = products.length;
    const totalPrice = products.reduce((sum, product) => sum + (product.list_price || 0), 0);
    const averagePrice = totalProducts ? totalPrice / totalProducts : 0;
    const uniqueTypes = new Set(products.map((product) => product.type)).size;

    statsContainer.innerHTML = `
        <h3>Statistiques</h3>
        <p>Total produits : <strong>${totalProducts}</strong></p>
        <p>Prix moyen : <strong>${averagePrice.toFixed(2)} €</strong></p>
        <p>Types distincts : <strong>${uniqueTypes}</strong></p>
    `;
}

export function createProductCard(product: Product): HTMLDivElement {
    const card = document.createElement('div');
    card.className = 'product-card';

    const picture = product.image_1920 ?? null;
    const address = `${product.street} ${product.number_house}, ${product.postal_code}`;

    const available = product.qty_available === 0 ? "Pas d'appartement disponible" : `Il y a ${product.qty_available} appartements disponible`

    card.innerHTML = `
        <img src="data:image/png;base64, ${picture}" width="300"/>
        <h3>${product.name ?? "L'appartement n'a pas de nom."}</h3>
        <p><strong>Loyer :</strong> ${product.list_price.toFixed(2)} €</p>
        <p><strong>Adresse :</strong> ${address}</p>
        <p><strong> ${available} </p>
    `;

    const rentButton = document.createElement('button');
    rentButton.type = 'button';
    rentButton.textContent = 'Demande de location';
    rentButton.className = 'btn-primary';
    rentButton.addEventListener('click', () => {
        openRentalModal(product);
    });

    card.appendChild(rentButton);
    return card;
}

function setOrderStatus(message: string, isError = false): void {
    const area = document.getElementById('areaOrder');
    if (!area) {
        return;
    }

    area.classList.remove('hidden');
    const title = area.querySelector('h3');
    const paragraph = area.querySelector('p');

    if (title) {
        title.textContent = isError ? 'Commande - Erreur' : 'Commande';
    }
    if (paragraph) {
        paragraph.textContent = message;
    }
}

function toggleModal(show: boolean): void {
    const overlay = document.getElementById('rentalModalOverlay');
    if (!overlay) {
        return;
    }
    overlay.classList.toggle('hidden', !show);
}

function openRentalModal(product: Product): void {
    selectedProduct = product;
    const summary = document.getElementById('modalProductSummary');
    if (summary) {
        summary.textContent = `${product.name ?? 'bien locatif'} avec un loyer de ${product.list_price.toFixed(2)} €`;
    }

    const confirmBtn = document.getElementById('modalConfirm') as HTMLButtonElement | null;
    if (confirmBtn) {
        confirmBtn.removeAttribute('disabled');
    }

    toggleModal(true);
}

function closeRentalModal(): void {
    toggleModal(false);
    selectedProduct = null;
    const confirmBtn = document.getElementById('modalConfirm') as HTMLButtonElement | null;
    if (confirmBtn) {
        confirmBtn.removeAttribute('disabled');
    }
    isSubmitting = false;
}

function getCustomerPayload(): { name: string; email: string; phone: string } {
    const nameField = document.getElementById('modalCustomerName') as HTMLInputElement | null;
    const emailField = document.getElementById('modalCustomerEmail') as HTMLInputElement | null;
    const phoneField = document.getElementById('modalCustomerPhone') as HTMLInputElement | null;

    if (!nameField || !emailField || !phoneField) {
        throw new Error('Champs client introuvables.');
    }

    const name = nameField.value.trim();
    const email = emailField.value.trim();
    const phone = phoneField.value.trim();

    if (!name) {
        throw new Error('Le nom du client est requis.');
    }

    return { name, email, phone };
}

async function createCustomer(): Promise<number> {
    const { name, email, phone } = getCustomerPayload();

    const partnerId = await callOdoo<number>(
        'res.partner',
        'create',
        [
            {
                name,
                email: email || undefined,
                phone: phone || undefined,
                customer_rank: 1,
            },
        ],
    );

    return partnerId;
}

async function rentSelectedProduct(trigger?: HTMLButtonElement): Promise<void> {
    if (!selectedProduct) {
        setOrderStatus('Aucun produit sélectionné.', true);
        return;
    }

    if (isSubmitting) {
        return;
    }
    isSubmitting = true;

    try {
        trigger?.setAttribute('disabled', 'true');
        setOrderStatus('Création de la demande de location en cours...');

        const isAuthenticated = await authenticate();
        if (!isAuthenticated) {
            throw new Error('Authentification échouée.');
        }

        const product = selectedProduct;
        const customerId = await createCustomer();
        const productId = product.product_variant_id?.[0] ?? product.id;
        const orderId = await callOdoo<number>(
            'sale.order',
            'create',
            [
                {
                    partner_id: customerId,
                    order_line: [
                        [
                            0,
                            0,
                            {
                                product_id: productId,
                                product_uom_qty: 1,
                                price_unit: product.list_price,
                            },
                        ],
                    ],
                },
            ],
        );

        setOrderStatus(`Commande ${orderId} créée pour le client ${customerId}.`);
        closeRentalModal();
    } catch (error) {
        console.error('Erreur lors de la création de commande :', error);
        setOrderStatus(
            error instanceof Error ? error.message : 'Erreur inconnue lors de la création de commande.',
            true,
        );
    } finally {
        trigger?.removeAttribute('disabled');
        isSubmitting = false;
    }
}

export async function loadProducts(): Promise<void> {
    toggleSection('areaError', false);
    toggleSection('areaStats', false);
    toggleSection('areaLoading', true, 'Chargement des produits en cours...');

    try {
        const isAuthenticated = await authenticate();
        if (!isAuthenticated) {
            throw new Error('Authentification échouée.');
        }

        const products = await callOdoo<Product[]>(
            'product.template',
            'search_read',
            [[]],
            {
                fields: [
                    'id',
                    'name',
                    'list_price',
                    'type',
                    'default_code',
                    'categ_id',
                    'qty_available',
                    'product_variant_id',
                    'street',
                    'number_house',
                    'postal_code',
                    'image_1920',
                ],
                limit: 50,
            },
        );

        renderProducts(products);
        displayStats(products);

        toggleSection('areaStats', true);
    } catch (error) {
        console.error('Erreur lors du chargement des produits :', error);
        toggleSection('areaError', true, error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
        toggleSection('areaLoading', false);
    }
}

export function setupRentalModalControls(): void {
    const overlay = document.getElementById('rentalModalOverlay');
    const closeBtn = document.getElementById('modalClose');
    const cancelBtn = document.getElementById('modalCancel');
    const confirmBtn = document.getElementById('modalConfirm') as HTMLButtonElement | null;

    const closeModal = () => closeRentalModal();

    overlay?.addEventListener('click', (event) => {
        if (event.target === overlay) {
            closeModal();
        }
    });

    closeBtn?.addEventListener('click', closeModal);
    cancelBtn?.addEventListener('click', closeModal);
    confirmBtn?.addEventListener('click', () => {
        void rentSelectedProduct(confirmBtn);
    });
}
