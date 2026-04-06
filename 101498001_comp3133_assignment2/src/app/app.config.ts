import { ApplicationConfig, inject, provideZoneChangeDetection } from '@angular/core';
import { HttpHeaders, provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { ApolloLink, InMemoryCache } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

function createApollo() {
  const httpLink = inject(HttpLink);
  const http = httpLink.create({ uri: environment.graphqlUri });
  const auth = setContext((_, prev) => {
    const token = sessionStorage.getItem('auth_token');
    const prevHeaders = prev['headers'] as HttpHeaders | undefined;
    let headers = prevHeaders ?? new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return { headers };
  });
  return {
    link: ApolloLink.from([auth, http]),
    cache: new InMemoryCache(),
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideApollo(createApollo),
  ],
};
