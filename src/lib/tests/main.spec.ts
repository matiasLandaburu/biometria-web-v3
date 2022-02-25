import 'mocha';
import { LinkBiometricModule } from '../main';

describe('Tests for LinkBiometricModule', () => {
  it(
    'Video',
    () => {
      cy.get('body').then((el: JQuery<HTMLBodyElement>) => {
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.width = '100vw';
        document.body.style.height = '100vh';
        document.body.style.display = 'flex';
        const container = document.createElement('div');

        el.html(container);
        const biometric = new LinkBiometricModule(container, '/src/lib/models');
        biometric.ejecucionIdentidad().then((data) => {
          // tslint:disable-next-line: no-console
          console.log(data);
        }).catch((err) => {
          // tslint:disable-next-line: no-console
          console.log(err);
        });
      });
    });
});
