import { ApiClient } from './api-client';

describe('ApiClient', () => {
    let originalFetch: any;

    beforeAll(() => {
        originalFetch = global.fetch;
    });

    afterAll(() => {
        global.fetch = originalFetch;
    });

    beforeEach(() => {
        global.fetch = jest.fn(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve({}),
        })) as any;
    });

    it('should correctly handle Headers object in options', async () => {
        const client = new ApiClient();
        const headers = new Headers();
        headers.append('X-Test-Header', 'test-value');

        // Access private method request via casting
        await (client as any).request('/test', {
            headers,
        });

        const fetchMock = global.fetch as jest.Mock;
        const callArgs = fetchMock.mock.calls[0];
        const fetchOptions = callArgs[1];

        let headerValue;
        if (fetchOptions.headers instanceof Headers) {
             headerValue = fetchOptions.headers.get('X-Test-Header');
        } else {
             headerValue = fetchOptions.headers['X-Test-Header'];
        }

        expect(headerValue).toBe('test-value');
    });

    it('should correctly handle plain object headers', async () => {
        const client = new ApiClient();
        const headers = { 'X-Plain-Header': 'plain-value' };

        await (client as any).request('/test', {
            headers,
        });

        const fetchMock = global.fetch as jest.Mock;
        const callArgs = fetchMock.mock.calls[0];
        const fetchOptions = callArgs[1];

        let headerValue;
        if (fetchOptions.headers instanceof Headers) {
             headerValue = fetchOptions.headers.get('X-Plain-Header');
        } else {
             headerValue = fetchOptions.headers['X-Plain-Header'];
        }

        expect(headerValue).toBe('plain-value');
    });
});
