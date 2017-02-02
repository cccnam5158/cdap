/*
 * Copyright © 2016 Cask Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

import React, {Component} from 'react';
import MyWranglerApi from 'api/wrangler';
import UploadFile from 'services/upload-file';
import shortid from 'shortid';
import SchemaStore from 'components/SchemaEditor/SchemaStore';
import SchemaEditor from 'components/SchemaEditor';
import {getParsedSchema} from 'components/SchemaEditor/SchemaHelpers';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';

require('./Experimental.scss');

export default class Experimental extends Component {
  constructor(props) {
    super(props);

    this.state = {
      file: null,
      data: null,
      length: 0,
      schemaModal: false,
      showAlert: false,
      errorMessage: ''
    };

    this.createWorkspace = this.createWorkspace.bind(this);
    this.deleteWorkspace = this.deleteWorkspace.bind(this);
    this.fileChange = this.fileChange.bind(this);
    this.upload = this.upload.bind(this);
    this.execute = this.execute.bind(this);
    this.getSchema = this.getSchema.bind(this);
    this.toggleSchemaModal = this.toggleSchemaModal.bind(this);
    this.dismissAlert = this.dismissAlert.bind(this);
  }

  createWorkspace() {
    let workspaceId = this.workspaceId.value;
    if (!workspaceId) {
      this.setState({
        errorMessage: 'Please fill out workspace id',
        showAlert: true
      });

      return;
    }

    MyWranglerApi.create({
      namespace: 'default',
      workspaceId
    }).subscribe((res) => {
      console.log(res);
    }, (err) => {
      console.log(err);
      this.setState({
        errorMessage: err.message,
        showAlert: true
      });
    });
  }

  deleteWorkspace() {
    let workspaceId = this.workspaceId.value;
    if (!workspaceId) {
      this.setState({
        errorMessage: 'Please fill out workspace id',
        showAlert: true
      });
      return;
    }

    MyWranglerApi.delete({
      namespace: 'default',
      workspaceId
    }).subscribe((res) => {
      console.log(res);
    }, (err) => {
      console.log(err);
      this.setState({
        errorMessage: err.message,
        showAlert: true
      });
    });
  }

  fileChange(e) {
    this.setState({file: e.target.files[0]});
  }

  upload() {
    if (!this.workspaceId.value) {
      this.setState({
        errorMessage: 'Please fill out workspace id',
        showAlert: true
      });

      return;
    }

    if (!this.state.file) {
      this.setState({
        errorMessage: 'Please select a file',
        showAlert: true
      });
      return;
    }

    console.log('upload begin');

    let url = `/namespaces/default/apps/wrangler/services/service/methods/workspaces/${this.workspaceId.value}/upload`;
    let headers = {
      'Content-Type': 'application/octet-stream',
      'X-Archive-Name': name,
    };
    UploadFile({url, fileContents: this.state.file, headers})
      .subscribe((res) => {
        console.log(res);
      }, (err) => {
        console.log(err);
        this.setState({
          errorMessage: err.message,
          showAlert: true
        });
      });
  }

  execute() {
    let workspaceId = this.workspaceId.value;
    if (!workspaceId) {
      this.setState({
        errorMessage: 'Please fill out workspace id',
        showAlert: true
      });
      return;
    }

    let requestObj = {
      namespace: 'default',
      workspaceId
    };

    let directives = this.textareaRef.value;

    if (directives) {
      directives = directives.split('\n');
      requestObj.directive = directives;
    }

    MyWranglerApi.execute(requestObj)
    .subscribe((res) => {
      this.setState({
        data: res.value,
        length: res.item
      });
    }, (err) => {
      console.log(err);
      this.setState({
        errorMessage: err.message,
        showAlert: true
      });
    });
  }

  getSchema() {
    let workspaceId = this.workspaceId.value;
    if (!workspaceId) {
      this.setState({
        errorMessage: 'Please fill out workspace id',
        showAlert: true
      });
      return;
    }

    let requestObj = {
      namespace: 'default',
      workspaceId
    };

    let directives = this.textareaRef.value;

    if (directives) {
      directives = directives.split('\n');
      requestObj.directive = directives;
    }

    MyWranglerApi.getSchema(requestObj)
    .subscribe((res) => {
      let tempSchema = {
        name: 'avroSchema',
        type: 'record',
        fields: res
      };
      let fields = getParsedSchema(tempSchema);
      SchemaStore.dispatch({
        type: 'FIELD_UPDATE',
        payload: {
          schema: { fields }
        }
      });

      this.toggleSchemaModal();
    }, (err) => {
      console.log(err);
      this.setState({
        errorMessage: err.message,
        showAlert: true
      });
    });
  }

  toggleSchemaModal() {
    this.setState({
      schemaModal: !this.state.schemaModal
    });
  }

  renderModal() {
    if (!this.state.schemaModal) { return null; }

    return (
      <Modal
        isOpen={this.state.schemaModal}
        toggle={this.toggleSchemaModal}
        zIndex="1070"
        className="experimental-schema-modal"
      >
        <ModalHeader>
          <span>
            Schema
          </span>

          <div
            className="close-section float-xs-right"
            onClick={this.toggleSchemaModal}
          >
            <span className="fa fa-times" />
          </div>
        </ModalHeader>
        <ModalBody>
          <fieldset disabled>
            <SchemaEditor />
          </fieldset>
        </ModalBody>
      </Modal>
    );
  }

  dismissAlert() {
    this.setState({showAlert: false});
  }

  renderAlert() {
    if (!this.state.showAlert) { return null; }

    return (
      <div className="alert alert-danger" role="alert">
        <span>{this.state.errorMessage}</span>
        <span
          className="float-xs-right"
          onClick={this.dismissAlert}
        >
          <i className="fa fa-times"></i>
        </span>
      </div>
    );
  }

  render() {
    let headers;
    if (this.state.length !== 0) {
      headers = Object.keys(this.state.data[0]);
    }

    return (
      <div className="experimental-container">
        {this.renderAlert()}
        <div className="row">
          <div className="col-xs-3 left-panel">
            <div className="directives-container">
              <div>
                <h4>Directives</h4>
                <textarea
                  className="form-control"
                  ref={(ref) => { this.textareaRef = ref; }}
                ></textarea>
              </div>

              <div className="text-xs-right">
                <button
                  className="btn btn-secondary"
                  onClick={this.getSchema}
                >
                  Schema
                </button>

                <button
                  className="btn btn-primary"
                  onClick={this.execute}
                >
                  Apply
                </button>
              </div>
            </div>
            <div className="workspace-container">
              <h4>Workspace</h4>
              <div>
                <input
                  type="text"
                  className="form-control"
                  ref={(ref) => {this.workspaceId = ref;}}
                />
              </div>

              <div className="text-xs-right">
                <button
                  className="btn btn-primary"
                  onClick={this.createWorkspace}
                >
                  Create
                </button>
                <button
                  className="btn btn-danger"
                  onClick={this.deleteWorkspace}
                >
                  Delete
                </button>
              </div>

              <div className="file-input">
                <input
                  type="file"
                  className="form-control"
                  onChange={this.fileChange}
                />
              </div>

              <div className="text-xs-right">
                <button
                  className="btn btn-primary"
                  onClick={this.upload}
                >
                  Upload
                </button>
              </div>

            </div>
          </div>
          <div className="col-xs-9 right-panel">
            {this.state.length === 0 ?
              (<h3 className="text-xs-center no-data">No data</h3>)
                : (
              <table className="table table-bordered table-striped">
                <thead className="thead-inverse">
                  {
                    headers.map((head) => {
                      return <th key={head}>{head}</th>;
                    })
                  }
                </thead>
                <tbody>
                  {
                    this.state.data.map((row) => {
                      return (
                        <tr key={shortid.generate()}>
                          {headers.map((head) => {
                            return <td key={shortid.generate()}>{row[head]}</td>;
                          })}
                        </tr>
                      );
                    })
                  }
                </tbody>
              </table>
            )}
          </div>
        </div>

        {this.renderModal()}
      </div>
    );
  }
}
