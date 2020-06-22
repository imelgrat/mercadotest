const express = require('express');
const path = require('path');
const config = require('config');
const get = require('lodash/get');
const { apiSearch, apiItem, apiItemDescription, apiCurrency, apiCurrencyList, apiCategory } = require('../api');

const server = express();
const port = process.env.PORT || get(config, 'express.port');

const DIST_DIR = path.join(__dirname, get(config, 'express.distributionDirectory'));

server.use(express.static(DIST_DIR));

server.get('/api/items', async (req, res) => {
    const results = await apiSearch(req.query.search);
    res.send(results);
});

server.get('/api/items/:id', async (req, res) => {
    const result = await apiItem(req.params.id);
    res.send(result);
});

server.get('/api/descriptions/:id', async (req, res) => {
    const result = await apiItemDescription(req.params.id);
    res.send(result);
});

server.get('/api/currencies/', async (req, res) => {
    const results = await apiCurrencyList();
    res.send(results);
});

server.get('/api/currencies/:id', async (req, res) => {
    const result = await apiCurrency(req.params.id);
    res.send(result);
});

server.get('/api/categories/:id', async (req, res) => {
    const result = await apiCategory(req.params.id);
    res.send(result);
});

server.get('*', (req, res) => {
    res.sendFile(path.join(__dirname,'../src/index.html'));
});

server.listen(port, function () {
    console.log('Server listening on port: ' + port);
});