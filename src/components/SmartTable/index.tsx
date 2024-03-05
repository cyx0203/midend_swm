
import { Table } from 'antd';
import _ from 'lodash';

const SmartTable : any = (props:any) => {
  const {
    dataSource,
    columns,
    loading,
    expandedRowRender,
    handleChange,
    title,
    scroll,
    paginationBool,
    rowKey,
    ...rest
  } = props;


  const paginationProps = {
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} 共 ${total} 条`,
    ...dataSource.pagination,
  };

  console.log(paginationBool);
  console.log(paginationBool === undefined ? "1":"2");
  const getValue = (obj) => {
    return Object.keys(obj)
    .map(key => obj[key])
    .join(',');
  }

  const handleTableChange = (pagination : any, filtersArg : any, sorter : any) => {
    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params : any = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...(_.omitBy(filters, _.isEmpty)),
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    
    handleChange(params);
  }

  return(
    <div>

      <Table 
        rowKey={rowKey || 'key'}
        dataSource={dataSource?.list || []} 
        columns={columns} 
        bordered 
        size="small" 
        loading={loading} 
        pagination={paginationBool === undefined && paginationProps}
        onChange={(pagination,filtersArg,sorter) => handleTableChange(pagination,filtersArg,sorter)}
        scroll={scroll || {}}
        title={title?() => title:null} 
        expandedRowRender={expandedRowRender} 
        {...rest}/>
      
  </div >
  );
};
export default SmartTable;
