import { useState, useCallback } from 'react';
import { Modal, Upload, Button, message, Table, Alert, Row, Col } from 'antd';
import { UploadOutlined, DownloadOutlined, CheckCircleOutlined, CiCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import { importFile, generateTemplate, type ColumnMapping, type ImportResult } from '../utils/import';

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  columns: ColumnMapping[];
  onSuccess: (data: unknown[]) => void;
  title?: string;
}

const ImportModal: React.FC<ImportModalProps> = ({ 
  open, 
  onClose, 
  columns, 
  onSuccess,
  title = '数据导入' 
}) => {
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<string[][]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'result'>(
    'upload'
  );

  const handleFileChange = useCallback(async (info: { file: unknown }) => {
    const file = (info.file as { originFileObj?: File })?.originFileObj;
    if (!file) return;
    setLoading(true);
    
    try {
      const content = await file.text();
      const lines = content.split('\n').filter(line => line.trim());
      const data = lines.map(line => {
        if (file.name.endsWith('.csv')) {
          const values: string[] = [];
          let currentValue = '';
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            
            if (char === '"') {
              if (inQuotes && nextChar === '"') {
                currentValue += '"';
                i++;
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === ',' && !inQuotes) {
              values.push(currentValue);
              currentValue = '';
            } else {
              currentValue += char;
            }
          }
          values.push(currentValue);
          return values;
        }
        return line.split('\t');
      });
      
      setPreviewData(data);
      setStep('preview');
    } catch (error) {
      message.error('读取文件失败');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleImport = useCallback(async () => {
    if (previewData.length < 2) {
      message.error('文件内容为空');
      return;
    }

    setLoading(true);
    
    try {
      const mapping: Record<string, string> = {};
      const headers = previewData[0];
      
      columns.forEach(col => {
        const index = headers.indexOf(col.label);
        if (index !== -1) {
          mapping[col.key] = headers[index];
        }
      });

      const result = await importFile(
        new File([previewData.map(row => row.join(',')).join('\n')], 'import.csv'),
        columns,
        mapping
      );

      setImportResult(result);
      setStep('result');

      if (result.success && result.data) {
        onSuccess(result.data);
      }
    } catch (error) {
      message.error('导入失败');
    } finally {
      setLoading(false);
    }
  }, [previewData, columns, onSuccess]);

  const handleDownloadTemplate = () => {
    const template = generateTemplate(columns);
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setPreviewData([]);
    setImportResult(null);
    setStep('upload');
  };

  const previewColumns = previewData[0]?.map((header, index) => ({
    title: header,
    dataIndex: String(index),
    key: String(index),
    width: Math.min(150, 800 / previewData[0]?.length),
    ellipsis: true,
  })) || [];

  const previewDataSource = previewData.slice(1, 11).map((row, index) => {
    const obj: Record<string, string> = { key: String(index) };
    row.forEach((cell, i) => {
      obj[String(i)] = cell;
    });
    return obj;
  });

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnClose
    >
      {step === 'upload' && (
        <div>
          <p style={{ marginBottom: 16, color: '#666' }}>
            支持导入 CSV、TSV 或 Excel 文件。请确保文件第一行为表头，且与系统字段对应。
          </p>
          
          <Upload
            accept=".csv,.tsv,.txt,.xls,.xlsx"
            showUploadList={false}
            beforeUpload={() => false}
            onChange={handleFileChange}
            disabled={loading}
          >
            <Button icon={<UploadOutlined />} loading={loading}>
              选择文件
            </Button>
          </Upload>
          
          <Button 
            icon={<DownloadOutlined />} 
            style={{ marginLeft: 8 }}
            onClick={handleDownloadTemplate}
          >
            下载模板
          </Button>

          <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileTextOutlined style={{ color: '#1890ff' }} />
              <span style={{ fontSize: 12, color: '#666' }}>
                支持格式: CSV (.csv), TSV (.tsv), Excel (.xls, .xlsx)
              </span>
            </div>
          </div>
        </div>
      )}

      {step === 'preview' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <span>预览数据（前10行）</span>
            <Button type="link" onClick={handleReset}>重新上传</Button>
          </div>

          <Table
            columns={previewColumns}
            dataSource={previewDataSource}
            pagination={false}
            size="small"
            scroll={{ x: true }}
          />

          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={handleReset}>取消</Button>
            <Button type="primary" loading={loading} onClick={handleImport}>
              确认导入
            </Button>
          </div>
        </div>
      )}

      {step === 'result' && (
        <div>
          {importResult?.success ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 18 }}>导入成功</div>
                  <div style={{ color: '#666', marginTop: 4 }}>
                    共 {importResult.importedRows} 条数据已导入
                  </div>
                </div>
              </div>
              
              <Row gutter={16}>
                <Col span={12}>
                  <div className="stat-card">
                    <div className="stat-info">
                      <div className="stat-value mono-value">{importResult.totalRows}</div>
                      <div className="stat-label">总记录数</div>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="stat-card">
                    <div className="stat-info">
                      <div className="stat-value mono-value" style={{ color: '#52c41a' }}>
                        {importResult.importedRows}
                      </div>
                      <div className="stat-label">成功导入</div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <CiCircleOutlined style={{ fontSize: 48, color: '#f5222d' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 18, color: '#f5222d' }}>导入失败</div>
                </div>
              </div>
              
              <Alert
                message="错误信息"
                description={importResult?.errors?.join('；')}
                type="error"
                showIcon
              />
            </div>
          )}

          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            {!importResult?.success && (
              <Button type="primary" onClick={handleReset}>重新导入</Button>
            )}
            <Button onClick={onClose}>关闭</Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ImportModal;