import SmartForm from "@/components/SmartForm";
import React,{useEffect,useRef} from "react";
import {Row, Col, Button, message} from "antd";
import { Ajax } from "@/core/trade";

export type CreateProps = {
  role: any;
  record: any;
  onSuccess:any
};


const Create : React.FC<CreateProps> = (props) => {
  const {
    role,
    record,
    onSuccess
  } = props;

  
  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 5 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 14 },
    }
  }

  const formRef = useRef(null);
  
  useEffect(()=>{
   
    formRef.current.getForm().setFieldsValue({...record});
    
  },[]);
  
  const getFields = () => {
   
    return [
      {type:'input',disabled:record && true,placeholder:'请输入',rules:[{required:true,message:'请输入',},{max:30,message:'最多30个字符'}],field:'account',label:'登录名'},
      {type:'input',placeholder:'请输入',rules:[{required:true,message:'请输入',},{max:30,message:'最多30个字符'}],field:'name',label:'名称'},
      {type:'input',placeholder:'请输入',rules:[{required:true,message:'请输入',},{max:11,message:'最多11个字符'}],field:'phone',label:'联系方式'},
      {type:'select',placeholder:'请选择',rules:[{required:true,message:'请选择',}],field:'roleId',label:'角色',options:role && role.tv||[]},
    ]
  }

  const refForm = (e) => {
    formRef.current = e;
  
   
  }

  const handleSubmit = () => {
      handleInsert(formRef.current.getForm().getFieldsValue());
  }

  const handleInsert = (fields) => {
   
    Ajax.Post(record && '/api/user.updateByPrimaryKeySelective'|| '/api/user.insertSelective',
      {
        ...fields,
        id: record && record.id,
        acountRef: fields.account,
      }
      , (ret: any) => {
        if(ret&&ret.hasOwnProperty('success')&&ret.success===true){
          message.success(record && '修改成功'||'创建成功');
          formRef.current.getForm().resetFields();
          onSuccess && onSuccess();
         
        }else{
          message.error(record && '修改失败'||'创建失败')
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
    <SmartForm
      formItemLayout={formItemLayout}
      ref={(e) => refForm(e) }
      onSubmit={handleSubmit}
      cols={1}
      formLayout="horizontal"
      fields={getFields()}
    >
      <Row gutter={16}>
        <Col span={2} offset={5}>
          <Button type="primary" htmlType="submit">提交</Button>
        </Col>
      </Row>
    </SmartForm>
  );
}
export default Create;