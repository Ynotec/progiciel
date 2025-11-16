import Product from '../models/productModel.ts';
import { authenticate } from './authenticateService.ts';
import { callOdoo } from './callOdooService.ts';

const TYPE_LABELS: Record<string, string> = {
    product: 'Stockable',
    consu: 'Consommable',
    service: 'Service',
};


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

    const typeLabel = TYPE_LABELS[product.type] ?? product.type ?? 'N/A';
    const category = product.categ_id ? product.categ_id[1] : 'N/A';
    const reference = product.default_code ?? 'N/A';

    card.innerHTML = `
        <h3>${product.name ?? 'Produit sans nom'}</h3>
        <p><strong>Type :</strong> ${typeLabel}</p>
        <p><strong>Prix :</strong> ${product.list_price.toFixed(2)} €</p>
        <p><strong>Référence :</strong> ${reference}</p>
        <p><strong>Catégorie :</strong> ${category}</p>
        <p><strong>Stock :</strong> ${product.qty_available}</p>
    `;

    return card;
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
                fields: ['name', 'list_price', 'type', 'default_code', 'categ_id', 'qty_available'],
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
