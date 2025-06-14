const API_CONFIG = {
    RECONNECT_INTERVAL: 5000,
    TIMEOUT: 10000,
    MAX_RETRIES: 3,
    ENDPOINTS: {
        TEST: 'https://api.binance.com/api/v3/ping',
        FUTURES: 'https://fapi.binance.com',
        SPOT: 'https://api.binance.com'
    }
};

class BinanceAPIManager {
    constructor() {
        this.connectionState = {
            connected: false,
            lastCheck: null,
            retries: 0,
            error: null
        };
        this.allFutures = [];
        this.allSpot = [];
    }

    async init() {
        await this.checkAPIConnection();
        this.startHealthCheck();
        await this.loadMarketData();
    }

    async checkAPIConnection() {
        try {
            const response = await this._fetchWithTimeout(
                API_CONFIG.ENDPOINTS.TEST,
                { method: 'GET' }
            );

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            this._updateConnectionState({
                connected: true,
                retries: 0,
                error: null
            });

            return true;
        } catch (error) {
            this._handleConnectionError(error);
            return false;
        }
    }

    async _fetchWithTimeout(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    async loadMarketData() {
        try {
            // Загрузка фьючерсных данных
            const futuresResponse = await fetch('https://fapi.binance.com/fapi/v1/exchangeInfo');
            if (!futuresResponse.ok) throw new Error(`Futures API error: ${futuresResponse.status}`);
            const futuresData = await futuresResponse.json();

            this.allFutures = futuresData.symbols
                .filter(s => s.contractType === 'PERPETUAL' && s.quoteAsset === 'USDT')
                .map(symbol => ({
                    symbol: symbol.symbol,
                    baseAsset: symbol.baseAsset,
                    quoteAsset: symbol.quoteAsset,
                    contractType: symbol.contractType,
                    marketType: 'futures'
                }));

            // Загрузка спотовых данных
            const spotResponse = await fetch('https://api.binance.com/api/v3/exchangeInfo');
            if (!spotResponse.ok) throw new Error(`Spot API error: ${spotResponse.status}`);
            const spotData = await spotResponse.json();

            this.allSpot = spotData.symbols
                .filter(s => s.quoteAsset === 'USDT' || s.quoteAsset === 'BTC' || s.quoteAsset === 'ETH' || s.quoteAsset === 'BNB')
                .map(symbol => ({
                    symbol: symbol.symbol,
                    baseAsset: symbol.baseAsset,
                    quoteAsset: symbol.quoteAsset,
                    marketType: 'spot'
                }));
        } catch (error) {
            console.error('Error loading market data:', error);
            this._handleConnectionError(error);
        }
    }

    async getCurrentPrice(symbol, marketType) {
        try {
            const endpoint = marketType === 'futures'
                ? `https://fapi.binance.com/fapi/v1/ticker/price?symbol=${symbol}`
                : `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;

            const response = await this._fetchWithTimeout(endpoint);
            const data = await response.json();
            return parseFloat(data.price);
        } catch (error) {
            console.error('Error getting current price:', error);
            return null;
        }
    }

    getMarketTypeBySymbol(symbol) {
        const futuresMatch = this.allFutures.find(c => c.symbol === symbol);
        if (futuresMatch) return 'futures';

        const spotMatch = this.allSpot.find(c => c.symbol === symbol);
        if (spotMatch) return 'spot';

        return null;
    }

    _updateConnectionState(stateUpdate) {
        this.connectionState = {
            ...this.connectionState,
            ...stateUpdate,
            lastCheck: new Date().toISOString()
        };
        this._updateUIStatus();
    }

    _handleConnectionError(error) {
        const newRetries = this.connectionState.retries + 1;
        const fatal = newRetries >= API_CONFIG.MAX_RETRIES;

        this._updateConnectionState({
            connected: false,
            retries: newRetries,
            error: fatal ? 'Fatal connection error' : error.message
        });

        if (!fatal) {
            setTimeout(() => this.checkAPIConnection(), API_CONFIG.RECONNECT_INTERVAL);
        }
    }

    startHealthCheck() {
        setInterval(() => {
            if (!this.connectionState.connected) {
                this.checkAPIConnection();
            }
        }, 30000);
    }

    _updateUIStatus() {
        const statusElement = document.getElementById('connectionStatus');
        if (!statusElement) return;

        const dotElement = statusElement.querySelector('.status-dot');
        const textElement = statusElement.querySelector('span');

        if (!dotElement || !textElement) return;

        if (this.connectionState.connected) {
            statusElement.classList.add('connected');
            statusElement.classList.remove('error');
            dotElement.classList.add('status-connected');
            dotElement.classList.remove('status-error');
            textElement.textContent = `Connected to Binance (${new Date(this.connectionState.lastCheck).toLocaleTimeString()})`;
        } else {
            statusElement.classList.add('error');
            statusElement.classList.remove('connected');
            dotElement.classList.add('status-error');
            dotElement.classList.remove('status-connected');
            textElement.textContent = `Connection error: ${this.connectionState.error || 'Unknown error'} [Retry ${this.connectionState.retries}/${API_CONFIG.MAX_RETRIES}]`;
        }
    }
}

export const apiManager = new BinanceAPIManager();
