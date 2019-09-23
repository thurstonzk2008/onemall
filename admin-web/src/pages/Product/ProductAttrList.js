import React, { PureComponent, Fragment, Component } from 'react';
import {
  Row,
  Col,
  Form,
  Card,
  Table,
  Button,
  Divider,
  Modal,
  Input,
  message,
  Switch,
  Select,
} from 'antd';
import moment from 'moment';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import PaginationHelper from '../../../helpers/PaginationHelper';
import styles from './ProductAttrList.less';

const FormItem = Form.Item;
const Option = Select.Option;

const ValueCreateForm = Form.create()(props => {
  const {
    valueModalVisible,
    form,
    handleValueAdd,
    handleValueModalVisible,
    modalType,
    initValues,
    tree,
  } = props;

  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      let pid = fieldsValue.pid;
      if (fieldsValue.pid) {
        pid = pid.split('-')[1];
        fieldsValue.pid = pid;
      }
      form.resetFields();
      handleValueAdd({
        fields: fieldsValue,
        modalType,
        initValues,
      });
    });
  };

  const selectStyle = {
    width: 200,
  };

  function onTypeChange(event) {
    initValues.type = parseInt(event.target.value);
  }

  const title = modalType === 'add' ? '添加规格值' : '编辑规格值';
  const okText = modalType === 'add' ? '添加' : '编辑';
  return (
    <Modal
      destroyOnClose
      title={title}
      visible={valueModalVisible}
      onOk={okHandle}
      okText={okText}
      onCancel={() => handleValueModalVisible()}
    >
      {modalType === 'add' ? (
        <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="规格">
          {form.getFieldDecorator('attrId', {
            // initialValue: template.durationHour ? template.durationHour : '3',
            rules: [
              {
                required: true,
                message: '请选择规格',
              },
            ],
          })(
            <Select placeholder="请选择规格" style={{ width: 120 }}>
              {tree.map(item => (
                <Option value={item.id}>{item.name}</Option>
              ))}
              {/* <Option value="1">1</Option> */}
            </Select>
          )}
        </FormItem>
      ) : null}
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="规格值">
        {form.getFieldDecorator('name', {
          initialValue: initValues ? initValues.name : null,
          rules: [{ required: true, message: '请输入规格值！', min: 2 }],
        })(<Input placeholder="规格值" />)}
      </FormItem>
    </Modal>
  );
});

const CreateForm = Form.create()(props => {
  const { modalVisible, form, handleAdd, handleModalVisible, modalType, initValues } = props;

  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      let pid = fieldsValue.pid;
      if (fieldsValue.pid) {
        pid = pid.split('-')[1];
        fieldsValue.pid = pid;
      }
      form.resetFields();
      handleAdd({
        fields: fieldsValue,
        modalType,
        initValues,
      });
    });
  };

  const selectStyle = {
    width: 200,
  };

  function onTypeChange(event) {
    initValues.type = parseInt(event.target.value);
  }

  const title = modalType === 'add' ? '添加规格' : '编辑规格';
  const okText = modalType === 'add' ? '添加' : '编辑';
  return (
    <Modal
      destroyOnClose
      title={title}
      visible={modalVisible}
      onOk={okHandle}
      okText={okText}
      onCancel={() => handleModalVisible()}
    >
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="规格名称">
        {form.getFieldDecorator('name', {
          initialValue: initValues ? initValues.name : null,
          rules: [{ required: true, message: '请输入规格名称！', min: 2 }],
        })(<Input placeholder="规格名称" />)}
      </FormItem>
    </Modal>
  );
});

@connect(({ productAttrList, loading }) => ({
  productAttrList,
  attrData: productAttrList.attrData,
  tree: productAttrList.tree,
  loading: loading.models.productAttrList,
}))
@Form.create()
export default class ProductAttrList extends PureComponent {
  state = {
    modalVisible: false,
    valueModalVisible: false,
    modalType: 'add', //add or update
    initValues: {},
    current: 1,
    pageSize: 10,
    name: null,
  };

  componentDidMount() {
    this.initFetch();
  }

  initFetch = () => {
    const { dispatch } = this.props;
    const { current, pageSize, name } = this.state;
    dispatch({
      type: 'productAttrList/page',
      payload: {
        pageNo: current,
        pageSize,
        name,
      },
    });
    // const { dispatch } = this.props;
    dispatch({
      type: 'productAttrList/tree',
      payload: {
        ...PaginationHelper.defaultPayload,
      },
    });
  };

  expandedRowRender = record => {
    const columns = [
      {
        title: '规格值',
        dataIndex: 'name',
      },
      {
        title: '状态',
        // dataIndex: 'status',
        render: (text, record) => (
          <Switch
            checked={record.status === 1}
            onChange={checked => this.switchValueChange(checked, record)}
          />
        ),
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        sorter: true,
        render: val => <span>{moment(val).format('YYYY-MM-DD')}</span>,
      },
      {
        title: '操作',
        render: (text, record) => (
          <Fragment>
            <a onClick={() => this.handleValueModalVisible(true, 'update', record)}>编辑</a>
            <Divider type="vertical" />
            {/* <a className={styles.tableDelete} onClick={() => this.handleDelete(record)}>
              删除
            </a> */}
          </Fragment>
        ),
      },
    ];

    return <Table columns={columns} dataSource={record.values} pagination={false} />;
  };

  handleAdd = ({ fields, modalType, initValues }) => {
    const { dispatch } = this.props;
    if (modalType === 'add') {
      dispatch({
        type: 'productAttrList/add',
        payload: {
          body: {
            ...fields,
          },
          onSuccess: () => {
            message.success('添加成功');
            this.handleModalVisible();
            this.initFetch();
          },
          onFail: response => {
            message.warn('添加失败' + response.message);
          },
        },
      });
    } else {
      dispatch({
        type: 'productAttrList/update',
        payload: {
          body: {
            ...initValues,
            ...fields,
          },
          onSuccess: () => {
            message.success('更新成功');
            this.handleModalVisible();
            this.initFetch();
          },
          onFail: response => {
            message.warn('更新失败' + response.message);
          },
        },
      });
    }
  };

  handleValueAdd = ({ fields, modalType, initValues }) => {
    const { dispatch } = this.props;
    if (modalType === 'add') {
      dispatch({
        type: 'productAttrList/value_add',
        payload: {
          body: {
            ...fields,
          },
          onSuccess: () => {
            message.success('添加成功');
            this.handleValueModalVisible();
            this.initFetch();
          },
          onFail: response => {
            message.warn('添加失败' + response.message);
          },
        },
      });
    } else {
      dispatch({
        type: 'productAttrList/value_update',
        payload: {
          body: {
            ...initValues,
            ...fields,
          },
          onSuccess: () => {
            message.success('更新成功');
            this.handleValueModalVisible();
            this.initFetch();
          },
          onFail: response => {
            message.warn('更新失败' + response.message);
          },
        },
      });
    }
  };

  handleModalVisible = (flag, modalType, initValues) => {
    this.setState({
      modalVisible: !!flag,
      initValues: initValues || {},
      modalType: modalType || 'add',
    });
  };

  handleValueModalVisible = (flag, modalType, initValues) => {
    this.setState({
      valueModalVisible: !!flag,
      initValues: initValues || {},
      modalType: modalType || 'add',
    });
  };

  handleTableChange = pagination => {
    const { pageSize, current, index } = pagination;
    this.setState(
      {
        current,
        pageSize,
      },
      function() {
        this.initFetch();
      }
    );
  };

  switchValueChange = (checked, record) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'productAttrList/value_update_status',
      payload: {
        body: {
          id: record.id,
          status: checked ? 1 : 2,
        },
        onSuccess: () => {
          message.success('修改状态成功');
          this.initFetch();
        },
      },
    });
  };

  switchChange = (checked, record) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'productAttrList/update_status',
      payload: {
        body: {
          id: record.id,
          status: checked ? 1 : 2,
        },
        onSuccess: () => {
          message.success('修改状态成功');
          this.initFetch();
        },
      },
    });
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState(
      {
        name: null,
      },
      function() {
        this.initFetch();
      }
    );
  };

  handleCondition = e => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const values = {
        ...fieldsValue,
      };

      if (values.name) {
        this.setState(
          {
            searched: true,
            name: values.name,
          },
          function() {
            this.initFetch();
          }
        );
      } else {
        this.initFetch();
      }

      // dispatch({
      //   type: 'fenfa/getCategoryList',
      //   payload: {
      //     key: values.name
      //   },
      // });
    });
  };

  renderSimpleForm() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form onSubmit={this.handleCondition} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="规格名称">
              {getFieldDecorator('name')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>

          <Col md={8} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                重置
              </Button>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const { attrData, productAttrList, loading, tree } = this.props;
    const columns = [
      {
        title: '规格名称',
        dataIndex: 'name',
      },
      {
        title: '状态',
        // dataIndex: 'status',
        render: (text, record) => (
          <Switch
            checked={record.status === 1}
            onChange={checked => this.switchChange(checked, record)}
          />
        ),
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        sorter: true,
        render: val => <span>{moment(val).format('YYYY-MM-DD')}</span>,
      },
      {
        title: '操作',
        render: (text, record) => (
          <Fragment>
            <a onClick={() => this.handleModalVisible(true, 'update', record)}>编辑</a>
            <Divider type="vertical" />
            <a onClick={() => this.handleValueModalVisible(true, 'add', {})}>新建规格值</a>
            {/* <a className={styles.tableDelete} onClick={() => this.handleDelete(record)}>
              删除
            </a> */}
          </Fragment>
        ),
      },
    ];

    const { modalVisible, modalType, initValues, valueModalVisible } = this.state;

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
      modalType,
      initValues,
    };

    const valueFormParentMethods = {
      handleValueAdd: this.handleValueAdd,
      handleValueModalVisible: this.handleValueModalVisible,
      modalType,
      initValues,
      tree: tree,
    };

    const pagination = {
      total: attrData.count,
      index: this.state.current,
      pageSize: this.state.pageSize,
    };

    return (
      <PageHeaderWrapper>
        <Card>
          <div className={styles.tableList}>
            <div className={styles.tableListOperator}>
              <Row>
                <Col span={8}>
                  <Button
                    icon="plus"
                    type="primary"
                    onClick={() => this.handleModalVisible(true, 'add', {})}
                  >
                    新建规格
                  </Button>
                </Col>
                <Col span={16}>
                  <div>{this.renderSimpleForm()}</div>
                </Col>
              </Row>
            </div>
          </div>
          <Table
            defaultExpandAllRows={true}
            columns={columns}
            dataSource={attrData.attrs ? attrData.attrs : []}
            rowKey="id"
            loading={loading}
            pagination={pagination}
            expandedRowRender={this.expandedRowRender}
            defaultExpandAllRows={false}
            onChange={pagination => this.handleTableChange(pagination)}
          />
        </Card>
        {modalVisible ? <CreateForm {...parentMethods} modalVisible={modalVisible} /> : null}
        {valueModalVisible ? (
          <ValueCreateForm {...valueFormParentMethods} valueModalVisible={valueModalVisible} />
        ) : null}
      </PageHeaderWrapper>
    );
  }
}
