import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { resetDB } from '../src/store/db';

// Give each test a fresh IDBFactory so store data never leaks between tests
beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
  resetDB();
});
