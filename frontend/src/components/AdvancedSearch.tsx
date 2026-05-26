import { useState, useCallback } from 'react';
import { Input, Select, Button, Tag, Space, DatePicker, Row, Col, InputNumber, Popover } from 'antd';
import { FilterOutlined, XOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'checkbox' | 'number';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface AdvancedSearchProps {
  filters: FilterOption[];
  onSearch: (query: Record<string, unknown>) => void;
  onReset: () => void;
  initialValues?: Record<string, unknown>;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ 
  filters, 
  onSearch, 
  onReset,
  initialValues = {} 
}) => {
  const [searchText, setSearchText] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, unknown>>(initialValues);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleFilterChange = useCallback((key: string, value: unknown) => {
    const newFilters = { ...advancedFilters, [key]: value };
    setAdvancedFilters(newFilters);
    
    const hasValue = value !== undefined && value !== null && value !== '' && 
      (Array.isArray(value) ? value.length > 0 : true);
    
    if (hasValue) {
      if (!activeFilters.includes(key)) {
        setActiveFilters([...activeFilters, key]);
      }
    } else {
      setActiveFilters(activeFilters.filter(k => k !== key));
    }
  }, [advancedFilters, activeFilters]);

  const handleQuickSearch = useCallback(() => {
    const query: Record<string, unknown> = {};
    if (searchText.trim()) {
      query.q = searchText.trim();
    }
    Object.entries(advancedFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && 
          (Array.isArray(value) ? value.length > 0 : true)) {
        query[key] = value;
      }
    });
    onSearch(query);
  }, [searchText, advancedFilters, onSearch]);

  const handleRemoveFilter = useCallback((key: string) => {
    const newFilters = { ...advancedFilters };
    delete newFilters[key];
    setAdvancedFilters(newFilters);
    setActiveFilters(activeFilters.filter(k => k !== key));
  }, [advancedFilters, activeFilters]);

  const handleResetAll = useCallback(() => {
    setSearchText('');
    setAdvancedFilters({});
    setActiveFilters([]);
    onReset();
  }, [onReset]);

  const renderFilter = (filter: FilterOption) => {
    const value = advancedFilters[filter.key];
    
    switch (filter.type) {
      case 'text':
        return (
          <Input
            key={filter.key}
            placeholder={filter.placeholder || filter.label}
            value={value as string}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            style={{ width: 200 }}
          />
        );
      case 'select':
        return (
          <Select
            key={filter.key}
            placeholder={filter.placeholder || filter.label}
            value={value as string}
            onChange={(v) => handleFilterChange(filter.key, v)}
            style={{ width: 200 }}
            allowClear
          >
            {filter.options?.map(opt => (
              <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
            ))}
          </Select>
        );
      case 'date':
        return (
          <DatePicker
            key={filter.key}
            placeholder={filter.placeholder || filter.label}
            value={value ? dayjs(value as string) : null}
            onChange={(date) => handleFilterChange(filter.key, date?.format('YYYY-MM-DD'))}
            style={{ width: 200 }}
          />
        );
      case 'checkbox':
        return (
          <Select
            key={filter.key}
            mode="multiple"
            placeholder={filter.placeholder || filter.label}
            value={value as string[]}
            onChange={(v) => handleFilterChange(filter.key, v)}
            style={{ width: 200 }}
          >
            {filter.options?.map(opt => (
              <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
            ))}
          </Select>
        );
      case 'number':
        return (
          <InputNumber
            key={filter.key}
            placeholder={filter.placeholder || filter.label}
            value={value as number}
            onChange={(v) => handleFilterChange(filter.key, v)}
            style={{ width: 200 }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 200 }}>
          <Input.Search
            placeholder="快速搜索..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={handleQuickSearch}
            style={{ width: '100%', maxWidth: 400 }}
          />
        </div>

        {activeFilters.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {activeFilters.map(key => {
              const filter = filters.find(f => f.key === key);
              const value = advancedFilters[key];
              let displayValue = '';
              
              if (Array.isArray(value)) {
                displayValue = value.join(', ');
              } else if (filter?.options) {
                const opt = filter.options.find(o => o.value === value);
                displayValue = opt?.label || String(value);
              } else {
                displayValue = String(value);
              }
              
              return (
                <Tag 
                  key={key} 
                  closable 
                  onClose={() => handleRemoveFilter(key)}
                  color="blue"
                >
                  {filter?.label}: {displayValue}
                </Tag>
              );
            })}
          </div>
        )}

        <Space>
          <Popover
            content={
              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ fontWeight: 600 }}>高级筛选</span>
                  {activeFilters.length > 0 && (
                    <Button type="text" danger size="small" onClick={handleResetAll}>
                      清除全部
                    </Button>
                  )}
                </div>
                <Row gutter={[16, 16]}>
                  {filters.map(filter => (
                    <Col key={filter.key}>{renderFilter(filter)}</Col>
                  ))}
                </Row>
                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <Button onClick={() => setShowAdvanced(false)}>取消</Button>
                  <Button type="primary" onClick={handleQuickSearch}>
                    应用筛选
                  </Button>
                </div>
              </div>
            }
            title="高级搜索"
            trigger="click"
            open={showAdvanced}
            onOpenChange={setShowAdvanced}
          >
            <Button icon={<FilterOutlined />}>筛选</Button>
          </Popover>
          
          {activeFilters.length > 0 && (
            <Button icon={<XOutlined />} onClick={handleResetAll}>
              重置
            </Button>
          )}
        </Space>
      </div>
    </div>
  );
};

export default AdvancedSearch;
export type { FilterOption };