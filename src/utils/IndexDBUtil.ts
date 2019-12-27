let db: any = null;

const open = ({ dbName, onSuccess, onError }) => {
  const request = window.indexedDB.open(dbName);
  request.onerror = event => {
    console.warn(`数据库打开报错`, event);
    if (onError) onError(event);
  };

  request.onsuccess = event => {
    db = request.result;
    console.debug(`数据库打开成功`, event);
    if (onSuccess) onSuccess();
  };

  request.onupgradeneeded = (event: any) => {
    db = event.target.result;
    console.debug(`数据库升级成功`, event);

    let objectStore;
    if (!db.objectStoreNames.contains('chatList')) {
      objectStore = db.createObjectStore('chatList', { keyPath: 'id' });
      objectStore.createIndex('type', 'type', { unique: false });
    }
  };
};

const add = ({ tableName, record, onSuccess, onError }) => {
  const request = db
    .transaction([tableName], 'readwrite')
    .objectStore(tableName)
    .add(record);

  request.onsuccess = (event: any) => {
    console.debug(`数据写入成功`, event);
    if (onSuccess) onSuccess();
  };

  request.onerror = (event: any) => {
    console.warn(`数据写入失败`, event);
    if (onError) onError(event);
  };
};

const read = ({ tableName, key, onSuccess, onError }) => {
  const transaction = db.transaction([tableName]);
  const objectStore = transaction.objectStore(tableName);
  const request = objectStore.get(key);

  request.onerror = (event: any) => {
    console.warn(`事务失败`, event);
    if (onError) onError(event);
  };

  request.onsuccess = (event: any) => {
    console.debug(`事务成功`, event);
    console.debug(request.result || '未获得数据记录');
    if (onSuccess) onSuccess(request.result);
  };
};

const readAll = ({ tableName, onSuccess, onError }) => {
  const objectStore = db.transaction(tableName).objectStore(tableName);
  const request = objectStore.openCursor();

  request.onsuccess = (event: any) => {
    const cursor = event.target.result;

    if (cursor) {
      console.debug(`Id: ${cursor.key}`);
      console.debug(cursor.value);
      if (onSuccess) onSuccess(cursor.value);
      cursor.continue();
    } else {
      console.debug('没有更多数据了！');
    }
  };

  request.onerror = event => {
    console.warn(`获取全部数据失败`, event);
    if (onError) onError(event);
  };
};

const update = ({ tableName, record, onSuccess, onError }) => {
  const request = db
    .transaction([tableName], 'readwrite')
    .objectStore(tableName)
    .put(record);

  request.onsuccess = event => {
    console.debug(`数据更新成功`, event);
    if (onSuccess) onSuccess();
  };

  request.onerror = event => {
    console.warn(`数据更新失败`, event);
    if (onError) onError(event);
  };
};

const remove = ({ tableName, key, onSuccess, onError }) => {
  const request = db
    .transaction([tableName], 'readwrite')
    .objectStore(tableName)
    .delete(key);

  request.onsuccess = event => {
    console.debug(`数据删除成功`, event);
    if (onSuccess) onSuccess();
  };

  request.onerror = event => {
    console.warn(`数据删除失败`, event);
    if (onError) onError(event);
  };
};

const readByIndex = ({ tableName, indexName, indexValue, onSuccess, onError }) => {
  const transaction = db.transaction([tableName], 'readonly');
  const store = transaction.objectStore(tableName);
  const index = store.index(indexName);
  const request = index.get(indexValue);

  request.onsuccess = e => {
    const { result } = e.target;
    if (result) {
      console.debug(result);
    } else {
      console.debug('未获得数据记录');
    }
    if (onSuccess) onSuccess();
  };

  request.onerror = event => {
    console.warn(`index获取数据失败`, event);
    if (onError) onError(event);
  };
};

const clear = ({ tableName, onSuccess, onError }) => {
  const transaction = db.transaction([tableName], 'readwrite');
  const store = transaction.objectStore(tableName);
  const request = store.clear();

  request.onsuccess = event => {
    console.debug(`数据清空成功`, event);
    if (onSuccess) onSuccess();
  };

  request.onerror = event => {
    console.warn(`数据清空失败`, event);
    if (onError) onError(event);
  };
};

export default {
  open,
  add,
  read,
  readAll,
  readByIndex,
  update,
  remove,
  clear,
};
