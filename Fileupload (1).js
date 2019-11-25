import React from "react";
import {Component} from 'react';
// @material-ui/core components
import {makeStyles} from "@material-ui/core/styles";
import {hpe} from 'grommet-theme-hpe';
// import "."
import "../index.css";
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import {Form, FormField, Grommet, CheckBox, Button, TextInput, Box} from 'grommet';
import Card from "@material-ui/core/Card";
import {CardContent, Grid, Paper, Typography} from "@material-ui/core";
import TextField from '@material-ui/core/TextField';
import MButton from '@material-ui/core/Button';
import {red} from "@material-ui/core/colors";
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import MySnackbarContentWrapper from '../Components/MySnackbarContentWrapper';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import FileUploadProgress  from 'react-fileupload-progress';

import ListOfOSPackage from "./ListOfOSPackage";
/*import Dropzone  from "react-dropzone";*/
// import MyDropZone from "./MyDropZone";
import Dropzone from   "./Dropzone";
class DeployServers extends Component {

    constructor(props) {
        super(props);
        this.inputLabel = React.createRef();
        this.state = {
            submitted: false,
            disableSubmit: false,
            isFail: false,
            isSuccess: false,
            showMsg: '',
            nextClicked: false,
            next:false,
            serversCount: '',
            files: [],
            dropzoneActive: "inactive",
            options: {
                baseUrl: "http://localhost/",
                    param:{
                    fid:0,
                        context: JSON.stringify(this.props.context)
                },
                chooseAndUpload: true,
                    fileFieldName : 'file',
                    paramAddToField : {context: JSON.stringify(this.props.context)},
                beforeUpload: this._beforeUpload,
                    uploading: this.uploadProgress,
                    uploadSuccess: this.uploadSuccess,
                    uploadError: this.uploadError,
                    uploadFail: this.uploadFail,
                    multiple:true
            },
            listView:'',
            newOSPackage:
                {
                    "OS": "",
                    "PackageName":"",
                    "ISO_http_path":""
                }
        }
        this.callApiPostJson = this.callApiPostJson.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleClose = this.handleClose.bind(this);
        //deployserver new Methods

        this.loadOS = this.loadOS.bind(this);
        this.callApiGetJson = this.callApiGetJson.bind(this);

        this.handleOS = this.handleOS.bind(this);
        this.handleNext = this.handleNext.bind(this);
        this.handleOVName = this.handleOVName.bind(this);
        this.handleUpload = this.handleUpload.bind(this);
        this.getFileUploadOptions = this.getFileUploadOptions.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.onDropzone = this.onDropzone.bind(this);
        this.buildFormData= this.buildFormData.bind(this);
    }

    componentDidMount() {
        this.loadOS();
    }

    callApiGetJson(endpoint) {
        let config = {};
        return fetch(endpoint)
            .then(response =>
                response.json().then(json => ({json, response}))
            ).then(({json, response}) => {
                if (!response.ok) {
                    return Promise.reject(json)
                }
                return json
            }).catch(err => console.log(err))
    }

    //TODO:Replace with Proper OS Rest Call
    loadOS() {
        var endpoint = 'http://10.188.210.14:5000/rest/ostype/list';
        this.callApiGetJson(endpoint).then(data => {
            this.setState({
                OSList: data
            });
        });
    }

    callApiPostJson(endpoint, postData) {
        //console.log("At callApiPostJson ",JSON.stringify(Object.fromEntries(postData)));
        var formData = JSON.stringify(postData.get('data'));
        //console.log("At callAPI PostJSON",formData);
        let config = {};
        config = {
            method: "POST",
            headers: {
                /*'Accept': 'multipart/form-data',
                'Content-Type': 'multipart/form-data'*/ },
            body: postData
        }

        return fetch(endpoint, config)
            .then(response =>
                response.json().then(json => ({json, response}))
            ).then(({json, response}) => {
                if (!response.ok) {
                    return Promise.reject(json)
                }
                return json
                //return json
            }).catch(err => err)
    }

    buildFormData(){
        var formData = new FormData();

        // Create JSON String
        var obj = new Object();
        obj.ospackage=this.state.newOSPackage.PackageName;
        obj.ostype=this.state.newOSPackage.OS;
        var jsonStr = JSON.stringify(obj);

        //appending to form
        formData.append('data',jsonStr );
        formData.append('file', this.state.newOSPackage.ISO_http_path);

        console.log("****At Build FormData FILE ****", formData.get('file'));
        console.log("****At Build FormData DATA ****", formData.get('data'));

        return formData;
    }

    handleClick() {
        // console.log('clicked');
        this.setState({open: true});
    }
    handleCancel() {
        this.setState({listView:true})
    }

    handleClose(event, reason) {
        if (reason === 'clickaway') {
            return;
        }
        this.setState({isFail: false, isSuccess: false});
    }

    handleNext() {
        console.log("While Upload",this.state.newOSPackage);
        var endpoint = 'http://10.188.210.14:5000/rest/upload';
        this.setState({next: true});
        if(this.state.newOSPackage.OS && this.state.newOSPackage.PackageName){
            this.callApiPostJson(endpoint, this.buildFormData()).then(data => {
              // alert(data);
                if(data.error){
                    this.setState({isFail:true,isSuccess:false, showMsg:data.error})
                }else{
                    this.setState({isFail:false,isSuccess:true,showMsg:"OS Package Created Successfully",});
                }
            });
        }


    }

    handleOS(event, index, value) {
        let deployServerObj = this.state.newOSPackage;
        deployServerObj.OS = event.target.value
        this.setState({
            selectedOS: event.target.value,
            newOSPackage: deployServerObj
        })
        // var level1menuItems = this.state.taxnomyLevel1Data;
    }

    handleOVName(event) {
        let osPackageObj = this.state.newOSPackage;
        osPackageObj.PackageName = event.target.value
        this.setState({
            PackageName: event.target.value,
            newOSPackage: osPackageObj
        })
    }



    /*onDrop = (accepted, rejected) => {
        this.setState({
            files: this.state.files.concat(accepted),
            dropzoneActive: "inactive"
        });
    };*/

    onDropzone(file) {
        let osPackageObj = this.state.newOSPackage;
        osPackageObj.ISO_http_path = file
       // console.log("FIle Name onDropzoneDrop", file.name);
        this.setState({
            dropzonetext: (
                <div style={{paddingLeft: '20px', paddingTop: '20px'}}><ArrowUpwardIcon colorIndex="brand"/> <br/> Selected
        file: {file.name} </div>),
            newOSPackage: osPackageObj,
            file: file,

        })

    }
    getFileUploadOptions(){
        var baseUrl = "http://localhost/" + 'upload';
        console.log("HSFileUpload baseURL: ", baseUrl);

        return {
            options: {
                baseUrl: baseUrl,
                param:{
                    fid:0,
                    context: JSON.stringify(this.props.context)
                },
                chooseAndUpload: true,
                fileFieldName : 'file',
                paramAddToField : {context: JSON.stringify(this.props.context)},
                beforeUpload: this._beforeUpload,
                uploading: this.uploadProgress,
                uploadSuccess: this.uploadSuccess,
                uploadError: this.uploadError,
                uploadFail: this.uploadFail,
                multiple:true
            }
        }

    }

    handleUpload(event){


        const fileField = document.querySelector('input[type="file"]');
        let osPackageObj = this.state.newOSPackage;
        osPackageObj.ISO_http_path = fileField.files[0];
        console.log("HTTPPath:",fileField.files[0]);
        this.setState({
            osPackageDetails: osPackageObj
        })
    }

    render() {
        const styles = {
            card: {
                marginLeft: '19%',
                marginRight: '10%',
                marginTop: '5%',
                width:'60%'
            },
            title: {
                fontSize: 14,
            },
            pos: {
                marginBottom: 12,
            },
            root: {
                display: 'grid',
                flexWrap: 'wrap',
            },
            formControl: {
                margin: '20px',
                minWidth: '120px',
            },
            selectEmpty: {
                marginTop: '5px',
            },
            select: {
                width: '300px',
                marginBottom: '10px'
            }
        };

        var OSMenuItems = this.state.OSList;
        var listView=null;
        var createOSPackage=null;
        const lastIndex = this.state.files.length - 1;
        let dropzoneRef;

        createOSPackage= <Paper className="paper">
            <Typography component="h1" variant="h6" align="center" gutterBottom>
                Create OS Package
            </Typography>
            <br/>
            <Grid container spacing={4}>
                <Grid container direction="row"
                      justify="center"
                      alignItems="center">
                    <form style={styles.root} autoComplete="off">
                        <div>
                            <Grid item xs={12}>
                                <TextField
                                    id="package"
                                    label="Package"
                                    style={{width:'300px'}}
                                    margin="normal"
                                    onChange={this.handleOVName}
                                    value={this.state.newOSPackage.PackageName}
                                    error={this.state.next && !this.state.newOSPackage.PackageName }
                                    required={this.state.next && !this.state.newOSPackage.PackageName }/>
                                <br/>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl className={styles.formControl} >
                                    <InputLabel htmlFor="outlined-age-simple">
                                        Select OS
                                    </InputLabel>
                                    <Select style={styles.select}
                                            value={this.state.selectedOS}
                                            labelWidth={this.state.labelWidth}
                                            onChange={this.handleOS}

                                            inputProps={{
                                                name: 'OS Package',
                                                id: 'OSPackage-simple',
                                            }}>
                                        {
                                            OSMenuItems !== undefined ?
                                                OSMenuItems.map((item, index) => {
                                                    return (<MenuItem key={index}
                                                                      value={item}><em>{item}</em></MenuItem>)
                                                }) : <MenuItem value="None"><em>None</em></MenuItem>
                                        }
                                    </Select>
                                </FormControl>
                                <br/>
                            </Grid>
                            <br/>
                            <Grid item xs={12} >
                               {/* <input
                                    accept="multipart/form-data"
                                    id="raised-button-file"
                                    type="file"
                                />
                                <label htmlFor="raised-button-file">
                                    <MButton variant="contained" size="medium" color="primary" style={{margin: '5px'}}  onClick={this.handleUpload}>
                                        upload
                                    </MButton>
                                </label>*/}

                                <Dropzone
                                    style={{border: "2px solid"}}
                                    onDrop={this.onDropzone}
                                    size="100"><div style={{paddingLeft: '20px', paddingTop: '20px'}}><ArrowUpwardIcon colorIndex="brand"/> <br/> Selected
                                    file: {this.state.file?this.state.file.name:'' } </div></Dropzone>

                            </Grid>
                            <br/>
                            <MButton variant="contained" size="medium" color="primary" style={{margin: '5px'}}
                                     type="submit" onClick={this.handleNext}>
                                Submit
                            </MButton>
                            <MButton variant="outlined" size="medium" color="primary" style={{margin: '5px'}}
                                     onClick={this.handleCancel}>
                                Cancel
                            </MButton>
                        </div>
                    </form>
                </Grid>
            </Grid>
        </Paper>;
        /*listView=<ListOfOSPackage/>*/

        return (
            <div>
                {createOSPackage}

            </div>
        )

    }
}

export default DeployServers;