import React from 'react';
import { Select } from 'antd';
import { useDataItems } from '../../hooks/useDataItems';

interface DataItemSelectProps {
  category: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
}

const DataItemSelect: React.FC<DataItemSelectProps> = ({
  category,
  value,
  onChange,
  placeholder = '请选择',
  disabled = false,
  allowClear = true,
}) => {
  const { items, loading } = useDataItems(category);

  return (
    <Select
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      loading={loading}
      allowClear={allowClear}
      showSearch
      optionFilterProp="label"
      options={items.map(item => ({
        value: item.code,
        label: item.name,
      }))}
    />
  );
};

export default DataItemSelect;
