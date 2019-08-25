import React from 'react';
import { Layout, Row, Col, Button, Icon, Tabs, Card, Popconfirm, Divider, Switch, Drawer, Form, Input, Table, Select, TreeSelect, Menu, Modal, Dropdown } from 'antd';
import './css/style.less';
import Head from './Head.jsx';
import Side from './Side.jsx';

const TabPane = Tabs.TabPane;

const { Content } = Layout;

const FormItem = Form.Item;

const confirm = Modal.confirm;

function showDelete() {
  confirm({
    title: 'Do you want to delete ?',
    content: '',
    onOk() {},
    onCancel() {},
  });
}

const menu = (
  <Menu>
    <Menu.Item key="action-1">Edit</Menu.Item>
    <Menu.Item key="action-2" onClick={showDelete}>Delete</Menu.Item>
  </Menu>
);

const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends React.Component {
  state = {
    editing: false,
  }

  componentDidMount() {
    if (this.props.editable) {
      document.addEventListener('click', this.handleClickOutside, true);
    }
  }

  componentWillUnmount() {
    if (this.props.editable) {
      document.removeEventListener('click', this.handleClickOutside, true);
    }
  }

  toggleEdit = () => {
    const editing = !this.state.editing;
    this.setState({ editing }, () => {
      if (editing) {
        this.input.focus();
      }
    });
  }

  handleClickOutside = (e) => {
    const { editing } = this.state;
    if (editing && this.cell !== e.target && !this.cell.contains(e.target)) {
      this.save();
    }
  }

  save = () => {
    const { record, handleSave } = this.props;
    this.form.validateFields((error, values) => {
      if (error) {
        return;
      }
      this.toggleEdit();
      handleSave({ ...record, ...values });
    });
  }

  render() {
    const { editing } = this.state;
    const {
      editable,
      dataIndex,
      title,
      record,
      index,
      handleSave,
      ...restProps
    } = this.props;
    return (
      <td ref={node => (this.cell = node)} {...restProps}>
        {editable ? (
          <EditableContext.Consumer>
            {(form) => {
              this.form = form;
              return (
                editing ? (
                  <FormItem style={{ margin: 0 }}>
                    {form.getFieldDecorator(dataIndex, {
                      rules: [{
                        required: true,
                        message: `${title} is required.`,
                      }],
                      initialValue: record[dataIndex],
                    })(
                      <Input
                        ref={node => (this.input = node)}
                        onPressEnter={this.save}
                      />
                    )}
                  </FormItem>
                ) : (
                  <div
                    className="editable-cell-value-wrap"
                    style={{ paddingRight: 24 }}
                    onClick={this.toggleEdit}
                  >
                    {restProps.children}
                  </div>
                )
              );
            }}
          </EditableContext.Consumer>
        ) : restProps.children}
      </td>
    );
  }
}

const AlertForm = Form.create()(
	class extends React.Component {

		constructor(props) {
	    super(props);
	    this.columns = [{
	      title: 'User with',
	      dataIndex: 'role',
	      width: 150,
	      editable: true,
	    }, {
	      title: 'Station / Station Group',
	      dataIndex: 'station',
	      editable: true,
	    }, {
	      title: 'Status',
	      dataIndex: 'status',
	      align: 'center',
	      render: (text, record) => {
	        return (
	          this.state.dataSource.length >= 1
	            ? (
	              <Switch size="small" defaultChecked />
	            ) : null
	        );
	      },
	    }, {
	      title: 'Action',
	      dataIndex: 'action',
	      align: 'center',
	      render: (text, record) => {
	        return (
	          this.state.dataSource.length >= 1
	            ? (
	              <Dropdown overlay={menu} trigger={['click']} placement="bottomLeft">
							   	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 512" className="action-img"><path d="M204 102c28 0 51-23 51-51S232 0 204 0s-51 23-51 51 23 51 51 51zm0 51c-28 0-51 23-51 51s23 51 51 51 51-23 51-51-23-51-51-51zm0 153c-28 0-51 23-51 51s23 51 51 51 51-23 51-51-23-51-51-51z"/></svg>
							  </Dropdown>
	            ) : null
	        );
	      },
	    }];

	    this.state = {
	      dataSource: [{
	        key: '0',
	        role: 'Role-1',
	        station: 'Station-1',
	      }, {
	        key: '1',
	        role: 'Role-2',
	        station: 'Station-2',
	      }],
	      count: 2,
	    };
	  }

	  handleDelete = (key) => {
	    const dataSource = [...this.state.dataSource];
	    this.setState({ dataSource: dataSource.filter(item => item.key !== key) });
	  }

	  handleAdd = () => {
	    const { count, dataSource } = this.state;
	    const newData = {
	      key: count,
	      role: `Role-${count+1}`,
	      station: `Station-${count+1}`,
	    };
	    this.setState({
	      dataSource: [...dataSource, newData],
	      count: count + 1,
	    });
	  }

	  handleSave = (row) => {
	    const newData = [...this.state.dataSource];
	    const index = newData.findIndex(item => row.key === item.key);
	    const item = newData[index];
	    newData.splice(index, 1, {
	      ...item,
	      ...row,
	    });
	    this.setState({ dataSource: newData });
	  }

		render() {
			const { visible, onCancel, onCreate, form } = this.props;
			const { getFieldDecorator } = form;
			const { dataSource } = this.state;
	    const components = {
	      body: {
	        row: EditableFormRow,
	        cell: EditableCell,
	      },
	    };
	    const columns = this.columns.map((col) => {
	      if (!col.editable) {
	        return col;
	      }
	      return {
	        ...col,
	        onCell: record => ({
	          record,
	          editable: col.editable,
	          dataIndex: col.dataIndex,
	          title: col.title,
	          handleSave: this.handleSave,
	        }),
	      };
	    });
			return (
				<div id="group_form">
					<Drawer
						title="Alert-1"
						width={920}
						placement="right"
						visible={visible}
						onClose={onCancel}
						maskClosable={false}
						style={{
							height: 'calc(100% - 55px)',
							overflow: 'auto',
							paddingBottom: 53,
						}}
					>
						<Form layout="vertical" hideRequiredMark>
							<Row gutter={16}>
								<Col span={12} className="wid-100">
									<Form.Item label="">
										<Input placeholder="Search" prefix={<Icon type="search" />} />
									</Form.Item>
								</Col>
								<Col span={12} className="wid-100 text-r">
									<Form.Item label="">
										<Button onClick={this.handleAdd} type="primary">
						          Add a row
						        </Button>
									</Form.Item>
								</Col>
							</Row>
							<Row gutter={16}>
	              <Col span={24}>
	                <Table
					          components={components}
					          rowClassName={() => 'editable-row'}
					          dataSource={dataSource}
					          columns={columns}
					        />
	              </Col>
           	 	</Row>
						</Form>
						<div
							style={{
								position: 'absolute',
								bottom: 0,
								width: '100%',
								borderTop: '1px solid #e8e8e8',
								padding: '10px 16px',
								textAlign: 'right',
								left: 0,
								background: '#fff',
								borderRadius: '0 0 4px 4px',
							}}
						>
							<Button
								style={{
									marginRight: 8,
								}}
								onClick={onCancel}
							>
								Cancel
							</Button>
							<Button onClick={onCancel} type="primary">Submit</Button>
						</div>
					</Drawer>
				</div>
			);
		}
	}
);


export default class Alert extends React.Component {

	constructor(props) {
		super(props);
		/**
		* This sets the initial state for the page.
		* @type {Object}
		*/
		this.state = {
			drawAlertVisible: false,
		};
	}

	showAlertModal = () => {
		this.setState({ drawAlertVisible: true });
	}

	stopDefault (e) {}

	handleCancel = () => {
		this.setState({ drawAlertVisible: false });
	}

	render () {

		return (
			<div id="alert">
				<Side active_link="alert" />
				<Head/>
				<Layout className="contains">
					<Layout>
						<Content className="contain">
							<Tabs type="card">
								<TabPane tab="Automatic" key="automatic">
									<Card title="" bordered={false}>
								    <Card.Grid onClick={this.showAlertModal} className="grid-style">
								    	<Row type="flex" justify="space-between">
								    		<Col className="alert-name" span={4}>
								    			Alert-1
								    		</Col>
								    		<Col className="text-c" span={10}>
								    			<Popconfirm className="info-msg" title="Alert Description....." icon={<Icon type="question-circle-o" style={{ display: 'none' }} />}>
												    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 330" className="limit-img info-img"><path d="M165 0C74.02 0 0 74.02 0 165s74.02 165 165 165 165-74.02 165-165S255.98 0 165 0zm0 300c-74.44 0-135-60.56-135-135S90.56 30 165 30s135 60.56 135 135-60.56 135-135 135z"/><path d="M165 70c-11.03 0-20 8.98-20 20 0 11.03 8.97 20 20 20 11.02 0 20-8.97 20-20 0-11.02-8.98-20-20-20zM165 140a15 15 0 0 0-15 15v90a15 15 0 0 0 30 0v-90a15 15 0 0 0-15-15z"/></svg>
												  </Popconfirm>
												  <span>
												  	<span>10 </span>Stations
												  	<Divider className="divider" type="vertical" />
												  	<span>20 </span>Users
												  </span>
								    		</Col>
								    		<Col className="text-r" span="4">
								    			<Switch size="small" defaultChecked onChange={(e) => this.stopDefault(e)}/>
								    		</Col>
								    	</Row>
								    </Card.Grid>
								    <Card.Grid onClick={this.showAlertModal} className="grid-style">
								    	<Row type="flex" justify="space-between">
								    		<Col className="alert-name" span={4}>
								    			Alert-2
								    		</Col>
								    		<Col className="text-c" span={10}>
								    			<Popconfirm className="info-msg" title="Alert Description....." icon={<Icon type="question-circle-o" style={{ display: 'none' }} />}>
												    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 330" className="limit-img info-img"><path d="M165 0C74.02 0 0 74.02 0 165s74.02 165 165 165 165-74.02 165-165S255.98 0 165 0zm0 300c-74.44 0-135-60.56-135-135S90.56 30 165 30s135 60.56 135 135-60.56 135-135 135z"/><path d="M165 70c-11.03 0-20 8.98-20 20 0 11.03 8.97 20 20 20 11.02 0 20-8.97 20-20 0-11.02-8.98-20-20-20zM165 140a15 15 0 0 0-15 15v90a15 15 0 0 0 30 0v-90a15 15 0 0 0-15-15z"/></svg>
												  </Popconfirm>
												  <span>
												  	<span>15 </span>Stations
												  	<Divider className="divider" type="vertical" />
												  	<span>15 </span>Users
												  </span>
								    		</Col>
								    		<Col className="text-r" span="4">
								    			<Switch size="small" defaultChecked />
								    		</Col>
								    	</Row>
								    </Card.Grid>
								    <Card.Grid onClick={this.showAlertModal} className="grid-style">
								    	<Row type="flex" justify="space-between">
								    		<Col className="alert-name" span={4}>
								    			Alert-3
								    		</Col>
								    		<Col className="text-c" span={10}>
								    			<Popconfirm className="info-msg" title="Alert Description....." icon={<Icon type="question-circle-o" style={{ display: 'none' }} />}>
												    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 330" className="limit-img info-img"><path d="M165 0C74.02 0 0 74.02 0 165s74.02 165 165 165 165-74.02 165-165S255.98 0 165 0zm0 300c-74.44 0-135-60.56-135-135S90.56 30 165 30s135 60.56 135 135-60.56 135-135 135z"/><path d="M165 70c-11.03 0-20 8.98-20 20 0 11.03 8.97 20 20 20 11.02 0 20-8.97 20-20 0-11.02-8.98-20-20-20zM165 140a15 15 0 0 0-15 15v90a15 15 0 0 0 30 0v-90a15 15 0 0 0-15-15z"/></svg>
												  </Popconfirm>
												  <span>
												  	<span>10 </span>Stations
												  	<Divider className="divider" type="vertical" />
												  	<span>23 </span>Users
												  </span>
								    		</Col>
								    		<Col className="text-r" span="4">
								    			<Switch size="small" defaultChecked />
								    		</Col>
								    	</Row>
								    </Card.Grid>
								    <Card.Grid onClick={this.showAlertModal} className="grid-style">
								    	<Row type="flex" justify="space-between">
								    		<Col className="alert-name" span={4}>
								    			Alert-4
								    		</Col>
								    		<Col className="text-c" span={10}>
								    			<Popconfirm className="info-msg" title="Alert Description....." icon={<Icon type="question-circle-o" style={{ display: 'none' }} />}>
												    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 330 330" className="limit-img info-img"><path d="M165 0C74.02 0 0 74.02 0 165s74.02 165 165 165 165-74.02 165-165S255.98 0 165 0zm0 300c-74.44 0-135-60.56-135-135S90.56 30 165 30s135 60.56 135 135-60.56 135-135 135z"/><path d="M165 70c-11.03 0-20 8.98-20 20 0 11.03 8.97 20 20 20 11.02 0 20-8.97 20-20 0-11.02-8.98-20-20-20zM165 140a15 15 0 0 0-15 15v90a15 15 0 0 0 30 0v-90a15 15 0 0 0-15-15z"/></svg>
												  </Popconfirm>
												  <span>
												  	<span>15 </span>Stations
												  	<Divider className="divider" type="vertical" />
												  	<span>30 </span>Users
												  </span>
								    		</Col>
								    		<Col className="text-r" span="4">
								    			<Switch size="small" defaultChecked />
								    		</Col>
								    	</Row>
								    </Card.Grid>
								  </Card>
								  <AlertForm 
										visible={this.state.drawAlertVisible}
										onCancel={this.handleCancel}
										onCreate={this.handleCreate}
									/>
								</TabPane>
								<TabPane tab="Mannual" key="mannual">
									Diaplay
								</TabPane>
							</Tabs>
						</Content>
					</Layout>
				</Layout>
			</div>
		);
	}
}