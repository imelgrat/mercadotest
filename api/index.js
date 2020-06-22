const superagent = require('superagent');
const trim = require('lodash/trim');
const get = require('lodash/get');
const set = require('lodash/set');
const isEmpty = require('lodash/isEmpty');
const toUpper = require('lodash/toUpper');

// Configuration data
const config = require('config');

// Global variable used to cache currency data (to avoid multiple HTTP requests). 
// Gets more useful when fetching many items in apiSearch()
let currencyList;

/**
 * Retrieves the category path (Names only. Can be enhanced by adding ID and URL)
 *
 * @param {Object} category The category to get the path from
 * @returns {Array} An array containing the category path
 */
function getPathFromRoot(category) {
    let categories = [];
    const results = get(category, 'path_from_root', []);

    if (Array.isArray(results) && results.length > 0) {
        results.map(async row => {
            const name = get(row, 'name', '');
            if (name) {
                categories.push(name);
            }
        }
        );
    }

    return categories;
}
/**
 * Retrieves the categories from a search. It provides data for displaying the category path in search results
 * The function attempts to get the category path from either filters or available_filters
 * If no results are found, the function will return the first category it finds
 * 
 * @param {Object} data The search results (from a call to https://api.mercadolibre.com/sites/MLA/search) 
 * @returns {Array} A
 */
function getCategories(data) {
    let categories = [], filterPath, availableFilterPath;

    // Get categories from "categories"
    let filters = get(data, 'filters', []);
    const availableFilters = get(data, 'available_filters', []);
    const categoryFilter = filters.find(filter => (get(filter, 'id', '') === 'category'));
    const categoryAvailableFilter = availableFilters.find(filter => (get(filter, 'id', '') === 'category'));

    if (categoryFilter && Array.isArray(categoryFilter.values) && !isEmpty(categoryFilter.values)) {
        filterPath = getPathFromRoot(categoryFilter.values.find(row => {
            return get(row, 'path_from_root', false) !== false;
        }));
    }

    if (categoryAvailableFilter && Array.isArray(categoryAvailableFilter.values) && !isEmpty(categoryAvailableFilter.values)) {
        availableFilterPath = getPathFromRoot(categoryAvailableFilter.values.find(row => {
            return get(row, 'path_from_root', false) !== false;
        }));
    }

    if (filterPath || availableFilterPath) {
        categories = filterPath ? filterPath : availableFilterPath;
    }

    if (isEmpty(categories)) {
        if (categoryFilter && Array.isArray(categoryFilter.values) && !isEmpty(categoryFilter.values)) {
            categories = [get(categoryFilter.values[0], 'name')];
        }
    }

    if (isEmpty(categories)) {
        if (categoryAvailableFilter && Array.isArray(categoryAvailableFilter.values) && !isEmpty(categoryAvailableFilter.values)) {
            categories = [get(categoryAvailableFilter.values[0], 'name')];
        }
    }

    return categories;
}
/**
 * Retrieves the data related to a single currency.
 *
 * @param {String} currencyId The currency ID
 * @returns {Object} The currency data
 */
async function apiCurrency(currencyId) {
    let currency = {};
    try {
        const res = await superagent.get(get(config, 'mercadoLibre.api.currencyURL') + toUpper(trim(currencyId)));
        if (res.statusCode === 200) {
            currency = JSON.parse(get(res, 'res.text', {}));
        }
    } catch (err) {
        console.error(err);
    }

    return currency;
}

/**
 * Retrieves the data related to a single category.
 *
 * @param {String} categoryId The category ID
 * @returns {Object} The category's ID, name and category path
 */
async function apiCategory(categoryId) {
    let category = {};
    try {
        const res = await superagent.get(get(config, 'mercadoLibre.api.categoryURL') + trim(categoryId));
        if (res.statusCode === 200) {
            const result = JSON.parse(get(res, 'res.text', {}));
            category = {
                id: get(result, 'id', ''),
                name: get(result, 'name', ''),
                path: getPathFromRoot(result),
            };
        }
    } catch (err) {
        console.error(err);
    }

    return category;
}
/**
 * Retrieves data for all currencies enabled in MELI
 *
 * @returns {Array} An array of currencies {id, symbol, description and supported decimal places} 
 */
async function apiCurrencyList() {
    try {
        const res = await superagent.get(get(config, 'mercadoLibre.api.currencyURL'));
        if (res.statusCode === 200) {
            currencyList = JSON.parse(get(res, 'res.text', {}));
        }
    } catch (err) {
        console.error(err);
    }

    return currencyList;
}
/**
 * Retrieves an item's condition (name only). 
 *
 * @param {Object} The item to get the condition from
 * @returns {String} The item's condition's name
 */
function getItemCondition(item) {
    const attributes = get(item, 'attributes', []);
    let itemCondition = '';

    // If the attributes property exists, find the ITEM_CONDITION property
    if (Array.isArray(attributes) && attributes.length > 0) {
        const itemConditionAttribute = attributes.find(filter => (get(filter, 'id', '') === 'ITEM_CONDITION'));
        if (itemConditionAttribute) {
            itemCondition = get(itemConditionAttribute, 'value_name');
        }
    }
    return itemCondition;
}

/**
 * Retrieve an item's description.
 * It first tries to get the formatted description. If not found, uses the plain-text description
 *
 * @param {String} itemId The item's ID
 * @returns
 */
async function apiItemDescription(itemId) {
    let response = '';

    try {
        const res = await superagent.get(get(config, 'mercadoLibre.api.itemsURL') + trim(itemId) + '/description');
        if (res.statusCode === 200) {
            const data = JSON.parse(get(res, 'res.text', {}));
            response = get(data, 'text');
            if (response === '') {
                response = get(data, 'plain_text');
            }
        }
    } catch (err) {
        console.error(err);
    }

    return response;
}

async function getItems(data) {
    let items = [];
    const results = get(data, 'results', []);

    if (Array.isArray(results)) {
        await Promise.all(results.map(async row => {
            let item = {};
            const currency = currencyList.find(filter => (get(filter, 'id', '') === get(row, 'currency_id', '')));
            const itemCondition = getItemCondition(row);

            // Get thumbnail URL and convert it into a 200x200 picture variation (to display a better picture in the results page)
            const thumbnail = get(row, 'thumbnail', '');
            const picture = thumbnail.slice(0, -5) + 'N' + thumbnail.slice(-4);

            set(item, 'id', get(row, 'id', ''));
            set(item, 'title', get(row, 'title', ''));
            set(item, 'price', {
                currency: get(currency, 'symbol', ''),
                amount: get(row, 'price', 0),
                decimals: get(currency, 'decimal_places', 0)
            });
            set(item, 'picture', picture);
            set(item, 'condition', itemCondition);
            set(item, 'free_shipping', get(row, 'shipping.free_shipping', false));

            // Not requested but added to simplify search results rendering
            set(item, 'state', get(row, 'address.state_name', ''));

            items.push(item);
        }
        ));
    }

    return items;
}

async function apiSearch(query = '') {
    const cleanQuery = trim(query);
    // Basic, empty response
    let response = {
        author: {
            name: get(config, 'author.name', ''),
            lastname: get(config, 'author.lastName', ''),
        },
        categories: [],
        items: [
        ]
    };

    // If a query string is provided, call the API to fetch results and process each item
    if (cleanQuery !== '') {
        try {
            await apiCurrencyList();
            const res = await superagent.get(get(config, 'mercadoLibre.api.searchURL'))
                .query({ q: cleanQuery, limit: get(config, 'mercadoLibre.api.searchLimit') });

            if (res.statusCode === 200) {
                const data = JSON.parse(get(res, 'res.text', {}));
                set(response, 'categories', getCategories(data));

                const items = await getItems(data);
                set(response, 'items', items);
            }

        } catch (err) {
            console.error(err);
        }

    }

    return response;
}

async function apiItem(id = '') {
    const cleanQuery = trim(id);

    // Basic, empty response
    let response = {
        author: {
            name: get(config, 'author.name', ''),
            lastname: get(config, 'author.lastName', ''),
        },
        item: {}
    };

    // If an ID is provided, fetch the item using the API and process it
    if (cleanQuery !== '') {
        try {
            const res = await superagent.get(get(config, 'mercadoLibre.api.itemsURL') + cleanQuery);

            if (res.statusCode === 200) {
                const row = JSON.parse(get(res, 'res.text', {}));
                let item = {};
                const id = get(row, 'id', '');
                const currency = await apiCurrency(get(row, 'currency_id', ''));
                const itemCondition = getItemCondition(row);
                const description = await apiItemDescription(id);

                // Get thumbnail URL and convert it into a 500px-wide picture variation (to display a better picture in the page)
                const thumbnail = get(row, 'thumbnail', '');
                const picture = thumbnail.slice(0, -5) + 'O' + thumbnail.slice(-4);

                set(item, 'id', id);
                set(item, 'title', get(row, 'title', ''));
                set(item, 'price', {
                    currency: get(currency, 'symbol', ''),
                    amount: get(row, 'price', 0),
                    decimals: get(currency, 'decimal_places', 0)
                });
                set(item, 'picture', picture);
                set(item, 'condition', itemCondition);
                set(item, 'free_shipping', get(row, 'shipping.free_shipping', false));
                set(item, 'sold_quantity', get(row, 'sold_quantity', 0));
                set(item, 'description', description);

                // Not requested but added to simplify single item rendering
                set(item, 'category_id',  get(row, 'category_id', ''));

                set(response, 'item', item);
            }

        } catch (err) {
            console.error(err);
        }

    }

    return response;
}


module.exports = { apiSearch, apiItem, apiItemDescription, apiCurrency, apiCurrencyList, apiCategory };