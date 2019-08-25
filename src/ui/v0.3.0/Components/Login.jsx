import React from 'react';
import './login.less';
import { Layout, Row, Col, Button, Icon, Form, Input, Checkbox } from 'antd';


const FormItem = Form.Item;

class LoginForm extends React.Component {

	handleSubmit (e){
		e.preventDefault();
		this.props.form.validateFields((err, values) => {
			if (!err) {
				console.log('Received values of form: ', values);
			}
		});
	}

	render () {

		const { getFieldDecorator } = this.props.form;

		return (
			<div id="login">
				<Layout>
					<Row>
						<Col span={14} className="left-section">
							<Row className="margin-top-15">
								<Col span={12} offset={2}>
									<div className="hed-text">Flood Monitoring System</div>
								</Col>
							</Row>
							<Row type="flex" justify="end">
								<Col span={15} className="center">
									<Row>
										<Col span={8}>
											<img src="http://127.0.0.1:8080/adb_full.png" className="adb"/>
										</Col>
										<Col span={8} className="back-grey"></Col>
										<Col span={8}>
											<img src="http://127.0.0.1:8080/taru_logo.jpg" className="logo-icon"/>
										</Col>
									</Row>
									<Row>
										<Col span={8} className="back-grey"></Col>
										<Col span={8}>
											<img src="http://127.0.0.1:8080/ucrt.png" className="logo-icon"/>
										</Col>
										<Col span={8} className="back-grey"></Col>
									</Row>
								</Col>
								<Col span={7}>
									<img src="http://127.0.0.1:8080/lg.jpg" className="lg"/>
								</Col>
							</Row>
							<img src="http://127.0.0.1:8080/login_back.svg" className="back-img"/>
						</Col>
						<Col span={10} className="login-section">
							<img src="http://127.0.0.1:8080/leaf_white.svg" className="aurassure-leaf"/>
							<Row type="flex" justify="space-around" className="margin-top-20">
								<Col span={12} offset={10}>
									<img src="http://127.0.0.1:8080/aurassure_logo.svg" className="aurassure-logo"/>
								</Col>
								<div className="text">Log in with your Aurassure Account</div>
							</Row>
							<Row type="flex" justify="space-around" className="margin-top-10">
								<Col span={12}>
									<Form onSubmit={()=>this.handleSubmit()}>
										<FormItem>
											{getFieldDecorator('userName', {
												rules: [{ required: true, message: 'Please input your username!' }],
											})(
												<Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Username" />
											)}
										</FormItem>
										<FormItem>
											{getFieldDecorator('password', {
												rules: [{ required: true, message: 'Please input your Password!', whitespace: true }],
											})(
												<Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Password" />
											)}
										</FormItem>
										<FormItem className="center">
											<Button type="primary" htmlType="submit" className="login-form-button mar-auto">
												Log in <Icon type="login" />
											</Button>
											<a href="">Forgot password ?</a>

										</FormItem>
									</Form>
								</Col>
							</Row>
							<div className="footer-text">Copyright © 2015-2018 Phoenix Robotix Private Limited. All Rights Reserved</div>
						</Col>
					</Row>
				</Layout>
			</div>
		);
	}
}

const Login = Form.create()(LoginForm);

export default Login;