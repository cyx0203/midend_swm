import {forwardRef, useImperativeHandle} from "react";
import {Form,Row,Button} from 'antd';
import FormCol from "./FormCol";



const SmartForm :any  = forwardRef((props:any,ref:any) => {
  const {
    formLayout,
    formItemLayout,
    onSubmit,
    cols,
    fields,
    submitName,
  } = props;


  const [refForm] = Form.useForm();
 
  // 暴露组件的方法
  useImperativeHandle(ref, () => ({
    getForm: () => {
      return refForm;
    }
  }));

  const reset = () =>{
    refForm.resetFields();
  }

  const formItemLayout1 = 
    (formLayout === 'horizontal') ? 
      ({
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
        ...formItemLayout
      })
      : 
      (formLayout === 'vertical' ? null :
        ((formItemLayout === undefined && cols ) &&
        {
          labelCol: {
            xs: { span: 24 },
            sm: { span: 8 },
            md: { span: 8 },
            lg: { span: 8 },
            xl: { span: 8 },
            xxl: { span: 8 },
          },
          wrapperCol: {
            xs: { span: 24 },
            sm: { span: 16 },
            md: { span: 16 },
            lg: { span: 16 },
            xl: { span: 16 },
            xxl: { span: 16 },
          },
        } ||formItemLayout)
    );

  return(<Form form={refForm} layout={(formLayout === 'inline' && cols)?null:formLayout} {...formItemLayout1} onFinish={onSubmit}>
  <Row gutter={8}>
    {
      fields && fields.map((item)=>{
       
        if(item.colSpan > cols){
          item.colSpan = cols;
        }
        if(formLayout === 'inline' && item.colSpan > 1){

          const formItemLayout2 = {
            ...formItemLayout1,
            labelCol: {
              xs: { span: 24 },
              sm: { span: formItemLayout1.labelCol.sm.span/item.colSpan },
            },
            wrapperCol: {
              xs: { span: 24 },
              sm: { span: 24-formItemLayout1.wrapperCol.xl.span/item.colSpan },
            },
          }
          return <FormCol cols={cols} item={item} formItemLayout={item.itemLayout||formItemLayout2} layout={formLayout} />
        } 
        return <FormCol cols={cols} item={item} layout={formLayout} formItemLayout={formItemLayout1} />

      })
    }
  </Row>
  { 
    !props.children && formLayout === 'inline' && 
    <Row gutter={16}>
      <div style={{marginLeft:'80%'}}>
        <Button type="primary" htmlType="submit">
          {submitName|| '查询'}
        </Button>
        <Button onClick={reset} style={{marginLeft:'24px'}}>
          重置
        </Button>
      </div>
    </Row>
  }
  {
    !props.children && formLayout === 'horizontal' && 
    <Row gutter={16}>
      <div style={{marginLeft:'21%'}}>
        <Button type="primary" htmlType="submit">
          {submitName|| '查询'}
        </Button>
        <Button onClick={reset} style={{marginLeft:'24px'}}>
        重置
        </Button>
      </div>
    </Row>
  }
  {props.children && props.children}
</Form>);
});

export default SmartForm; 