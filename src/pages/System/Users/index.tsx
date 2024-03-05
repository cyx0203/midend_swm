import { Button, Space, Popconfirm, message, Modal } from "antd";
import React, { useEffect,useState } from "react";
import {DomRoot,Ajax} from '@/components/PageRoot';
import _ from "lodash";
import SmartTable from "@/components/SmartTable";
import Create from "./creat";

const User : React.FC = () =>{
  const [tableDate,setTableDate] = useState(null);
  const [query,setQuery] = useState(null);
  const [visible,setVisible] = useState(false);
  const [role,setRole] = useState(null);
  const [record,setRecord] = useState(null);
 
  
  useEffect(()=>{
    searchRole();
   
  },[]);

  const searchRole = () => {
    Ajax.Post('/api/kv/role.selectByPrimaryKey',
      {
        key: 'id',       // key名称 
        value: 'name',   // value名称
        retKey: 'roleKV', 
      }
      , (ret: any) => {
        if(ret&&ret.hasOwnProperty('success')&&ret.success===true){
          let temp = ret.roleKV;
          setRole(temp);
          handleSearch();
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

  



  const handleSearch = (param = {}) => {
    const params = {...query,...param};
    Ajax.Post('/api/user.selectByPrimaryKey',
      {
        listKey: "users",
        ...params
      }
      , (ret: any) => {
        if(ret&&ret.hasOwnProperty('success')&&ret.success===true){
          let temp = ret.users;
          setTableDate(temp);
          setQuery(params);
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


  
  
  const delHandle = (record:any,index:Number) => {
   
    Ajax.Post('/api/user.deleteByPrimaryKey',
      {
      
        ...record
      }
      , (ret: any) => {
        if(ret&&ret.hasOwnProperty('success')&&ret.success===true){
          message.success('删除完成');
          handleSearch();
         
        }else{
          message.error('删除失败')
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

  

 

  const columns : any = [
    {
      title: '账号',
      dataIndex: 'account',
      key: 'account',
      width:150,
      // align:'center',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width:200,
      // align:'center',
     
    },
    {
      title: '等级',
      dataIndex: 'roleId',
      key: 'roleId',
      width:150,
      // align:'center',
      render: d => <span>{role && role.kv[d]}</span>
    },
    {
      title: '联系方式',
      dataIndex: 'phone',
      align:'phone',
      width:150,
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
            <Popconfirm title="确认删除吗?" onConfirm={() => delHandle(record,index)}>
              <a style={{ marginRight: '8px' }}>删除</a>
            </Popconfirm>
          
        </Space>
      ),
    },
  ];


  return(
    <DomRoot>
      <Button type="primary" style={{marginBottom:'8px'}} onClick={()=>{setVisible(true);setRecord(null)}}>创建</Button>
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
          <Create role={role} record={record} onSuccess={()=>{setVisible(false);handleSearch();}} />
        </Modal>
    </DomRoot>
    
  );
};

export default User;

