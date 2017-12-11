import { moduleForModel, test } from 'ember-qunit';

moduleForModel('mcs-person', 'Unit | Serializer | mcs person', {
  // Specify the other units that are required for this test.
  needs: ['serializer:mcs-person']
});

// Replace this with your real tests.
test('it serializes records', function(assert) {
  let record = this.subject();

  let serializedRecord = record.serialize();

  assert.ok(serializedRecord);
});
