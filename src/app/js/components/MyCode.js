import React from 'react';

import { Layout,Form,Row,Col, DatePicker, TimePicker, Button ,TreeSelect} from 'antd';

const { MonthPicker, RangePicker } = DatePicker;

const { SHOW_PARENT } = TreeSelect;

import Head from './imports/Head';
import Side from './imports/Side';

const { Content } = Layout;

class MyCode extends React.Component {

    constructor(props){

        super(props);

        this.state = {

            show_form : true,
            show_report : false,
            category_list : [],
            sub_category_object : [],
            stations_list : [],
            treeData : [],
            filtered_station_list_fms: [],
            value : null

        }

    }

    componentDidMount() {
        
        this.getSubCategoriesList();

    }
    
    getSubCategoriesList(){

        let that = this;
		let response_status;
		fetch('##PR_STRING_REPLACE_API_BASE_PATH##/stations/options', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include'
		}).then(function(Response) {
			response_status = Response.status;
			return Response.json();
		}).then(function(json) {
			// response_status = 403;
			if (response_status == 403) {
				console.log('error','unauthorized access');
			}
			else if (json.status === 'success') {
				// console.log('category_list:', json.category_list);
				treeData = [];
				let category_list_json = json.category_list;
				let category_list = [];

				if (category_list_json && category_list_json.length) {
					category_list_json.map((category) => {
						let obj1 = [];
						if (category.sub_category && category.sub_category.length) {
							category.sub_category.map((sub_cat) => {
								if (sub_cat.id < 13) {
									obj1.push({
										'name': sub_cat.name,
										'id': sub_cat.id
									});
								}
							});
						}
						category_list.push({
							id: category.id,
							name: category.name,
							sub_category: obj1
						});
					});
				}
				if (category_list && category_list.length) {
					category_list.map((category) => {
						let obj1 = [];
						if (category.sub_category && category.sub_category.length) {
							category.sub_category.map((sub_cat) => {
								obj1.push({
									'title': sub_cat.name,
									'value': sub_cat.id,
									'key': sub_cat.id,
								});
							});
						}
						treeData.push({
							title: category.name,
							value: '0-' +  category.id,
							key: '0-' +  category.id,
							children: obj1
						});
					});
				}
				let value = [];
				if (that.state.sub_category_selected) {
					value.push(that.state.sub_category_selected);
				}
				let sub_category_object = {};
				if (category_list && category_list.length) {
					category_list.map((cat) => {
						if (cat.sub_category && cat.sub_category.length) {
							cat.sub_category.map((sub) => {
								if (!sub_category_object[sub.id]) {
									sub_category_object[sub.id] = sub.name;
								} else {
									sub_category_object[sub.id] = sub.name;
								}
							})
						}
					});
				}
				that.setState({
					category_list: category_list,
					treeData: treeData,
					//value: value,
					sub_category_object: sub_category_object
				}, () => {
					// console.log('treeData', that.state.treeData);
					that.getStationsList();
				});
			} else {
                that.openNotification('error', json.message);
                console.log('error',json.message);
			}
		}).catch(function(ex) {
			console.log('parsing failed', ex);
			that.openNotification('error', 'Unable to load data!');
		});

    }

    getStationsList(){

        let that = this;

        fetch('##PR_STRING_REPLACE_API_BASE_PATH##/stations/list', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include'
		}).then(function(Response) {
			//response_status = Response.status;
			return Response.json();
		}).then(function(json) {

            console.warn('stations list',json);
            
            
			
		}).catch(function(ex) {
			console.log('parsing failed', ex);
			//that.openNotification('error', 'Unable to load data!');
			
		});

    }

    treeSelect(value, label, extra) {
		// console.log('value', value);
		// console.log('label', label);
		// console.log('extra', extra);
		let all_stations_fms = this.state.all_stations_fms.slice(0);
		if (!isNaN(extra.triggerValue) && extra.triggerValue && extra.checked) {
			let temp = [];
			if (all_stations_fms && all_stations_fms.length) {
				all_stations_fms.map((st) => {
					if (st.sub_category == extra.triggerValue) {
						temp.push({
							id: st.id,
							name: st.name
						});
					}
				});
			}
			this.setState({
				value: extra.triggerValue,
				filtered_station_list_fms: temp
			},() => console.log('value 1', this.state.value));
		} else if (!isNaN(extra.triggerValue)) {
			this.setState({
				value: null,
				filtered_station_list_fms: []
			},() => console.log('value 2', this.state.value));
		}
	}

    openNotification(type, msg) {
		notification[type]({
			message: msg,
			// description: msg,
			placement: 'bottomLeft',
			className: 'alert-' + type,
		});
	};

    render(){

        const tProps = {
			treeData: this.state.treeData,
			value: this.state.value,
			// onChange: (e) => this.onChange(e),
			treeCheckable: true,
			treeNodeFilterProp: 'title',
			placeholder: 'Please Select a station sub-category',
			treeDefaultExpandAll: true,
			showCheckedStrategy: SHOW_PARENT,
		};

        if(this.state.show_form){

            return <Layout className="mar-top-72">
            <Content className="contains">
                <div className="head">Select your requirements</div>
                <Form layout="vertical" hideRequiredMark>
                    <Row gutter={50}>

                    <Col span={12} className="wid-100">
						<Form.Item label="Select Sub-category">
							<TreeSelect onChange={(value, label, extra) => this.treeSelect(value, label, extra)} {...tProps} style={{ width: '100%' }} />
						</Form.Item>
					</Col>

                    </Row>
                </Form>
            </Content>
            </Layout>

        }
        else if(this.state.show_report){



        }

    }

}

export default MyCode;