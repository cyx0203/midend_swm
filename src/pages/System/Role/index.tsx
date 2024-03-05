import { DomRoot,Ajax } from "@/components/PageRoot";
import SmartTable from "@/components/SmartTable";
import React, {useState, useEffect} from "react";
import {Space,message,Modal,Button} from "antd";
import Create from "./create";



const Role : React.FC = () => {
  const [visible,setVisible] = useState(false);
  const [record,setRecord] = useState(null);
  const [tableDate,setTableDate] = useState(null);

  useEffect(()=>{
    handleSearch();
  },[]);

  const columns : any = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      width:150,
      // align:'center',
    },
    {
      title: '说明',
      dataIndex: 'desc',
      key: 'desc',
      width:200,
      // align:'center',
     
    },
    {
      title: '操作',
      key: 'action',
      align:'center',
      width:200,
      render: (text, record,index) => (
        <Space size="middle">
           <a style={{ marginRight: '8px' }} onClick={() => {setVisible(true);setRecord(record)}}>修改</a>
            {/* <Popconfirm title="确认删除吗?" onConfirm={() => delHandle(record,index)}>
              <a style={{ marginRight: '8px' }}>删除</a>
            </Popconfirm> */}
          
        </Space>
      ),
    },
  ];

  const handleSearch = (params = {}) => {
   
    Ajax.Post('/api/role.selectByPrimaryKey',
      {
        listKey: "role",
        ...params
      }
      , (ret: any) => {
        if(ret&&ret.hasOwnProperty('success')&&ret.success===true){
          let temp = ret.role;
          setTableDate(temp);
          
        } 
        else 
        {
          message.error('查询失败')
        }
      }
      , (err: any) => {
        //后台异常、网络异常的回调处理
        //该异常处理函数，可传可不传
        console.log('Ajax Post Error');
        console.log(err);
        console.log('OH No~~~😭');
      }
      ,
      //这里可以传指定的特殊http地址
      // { baseUrl: 'http://192.168.1.1:1020' }
    );

  }


  return(
    <DomRoot>
      <Button type="primary" style={{marginBottom:'8px'}} onClick={()=>{setVisible(true),setRecord(null)}}>创建</Button>
      <SmartTable
        bordered
      
        dataSource={tableDate || []}
        columns={columns}
      
        handleChange={(params)=>handleSearch(params)}
      />

      <Modal
        title='编辑用户'
        visible={visible}
        onCancel={()=>setVisible(false)}
        width='40%'
        footer={null}
        destroyOnClose
      >
        <Create record={record} onSuccess={()=>{setVisible(false);handleSearch();}} />
      </Modal>

    </DomRoot>
  );
};
export default Role;
