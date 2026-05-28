import { useState, useEffect, useCallback } from 'react';
import { getDataItems, initializeDataItems, type DataItem } from '../services/dataItem';

const dataItemsCache: Record<string, DataItem[]> = {};

export const useDataItems = (category: string) => {
  const [items, setItems] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    if (dataItemsCache[category]) {
      setItems(dataItemsCache[category]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getDataItems(category);
      dataItemsCache[category] = data;
      setItems(data);
    } catch (err) {
      try {
        await initializeDataItems();
        const data = await getDataItems(category);
        dataItemsCache[category] = data;
        setItems(data);
      } catch (initErr) {
        setError('加载数据项失败');
        setItems([]);
      }
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const refresh = useCallback(() => {
    delete dataItemsCache[category];
    loadItems();
  }, [category, loadItems]);

  return { items, loading, error, refresh };
};

export const clearDataItemsCache = () => {
  Object.keys(dataItemsCache).forEach(key => delete dataItemsCache[key]);
};
