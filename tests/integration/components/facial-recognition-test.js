import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('facial-recognition', 'Integration | Component | facial recognition', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{facial-recognition}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#facial-recognition}}
      template block text
    {{/facial-recognition}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
