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

import React, {Component, PropTypes} from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import T from 'i18n-react';
import debounce from 'lodash/debounce';
// import classnames from 'classnames';
import ReactPaginate from 'react-paginate';
// import PaginationDropdown from 'components/Pagination/PaginationDropdown';
// import {Tooltip} from 'reactstrap';

require('./EntityListHeader.scss');

export default class EntityListHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isFilterExpanded: false,
      isSortExpanded: false,
      searchText: props.searchText,
      sortOptions: props.sortOptions,
      filterOptions: props.filterOptions,
      numberOfPages: props.numberOfPages,
      numberOfEntities: props.numberOfEntities,
      currentPage: props.currentPage,
      activeFilter: props.activeFilter,
      activeSort: props.activeSort
    };

    this.debouncedHandleSearch = debounce(this.handleSearch.bind(this), 500);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      searchText: nextProps.searchText,
      sortOptions: nextProps.sortOptions,
      filterOptions: nextProps.filterOptions,
      numberOfPages: nextProps.numberOfPages,
      numberOfEntities: nextProps.numberOfEntities,
      currentPage: nextProps.currentPage,
      activeFilter: nextProps.activeFilter,
      activeSort: nextProps.activeSort
    });
  }

  handleFilterToggle() {
    this.setState({isFilterExpanded: !this.state.isFilterExpanded});
  }

  handleSortToggle() {
    if (this.props.isSortDisabled) {
      return;
    }
    this.setState({isSortExpanded: !this.state.isSortExpanded});
  }

  handlePageChange(data) {
    let clickedIndex = data.selected+1;
    this.props.onPageChange(clickedIndex);
  }

  onSearchChange(e) {
    this.setState({
      searchText: e.target.value
    });
    this.debouncedHandleSearch();
  }

  handleSearch() {
    this.props.onSearch(this.state.searchText);
  }

  toggleSortDropdownTooltip() {
    if (this.props.isSortDisabled) {
      this.setState({sortDropdownTooltip: !this.state.sortDropdownTooltip});
    }
  }
  render() {
    let tooltipId = 'filter-tooltip-target-id';
    const placeholder = T.translate('features.EntityListView.Header.search-placeholder');

    const sortDropdown = (
        <Dropdown
          disabled={this.props.isSortDisabled}
          isOpen={this.state.isSortExpanded}
          toggle={this.handleSortToggle.bind(this)}
          id={tooltipId}
        >
          <DropdownToggle
            tag='div'
            className="sort-toggle"
          >
            {
              this.state.activeSort ?
                <span>{this.state.activeSort.displayName}</span>
              :
                'Relevance'
            }
            <span className="fa fa-angle-down float-xs-right"></span>
          </DropdownToggle>
          <DropdownMenu>
            {
              this.state.sortOptions.map((option, index) => {
                return (
                  <DropdownItem
                    key={index}
                    onClick={this.props.onSortClick.bind(this, option)}
                  >
                    {option.displayName}
                    {
                      this.state.activeSort.fullSort === option.fullSort ?
                        <span className="fa fa-check float-xs-right"></span>
                      :
                        null
                    }
                  </DropdownItem>
                );
              })
            }
          </DropdownMenu>
        </Dropdown>
    );

    const filterDropdown = (
      <Dropdown
        isOpen={this.state.isFilterExpanded}
        toggle={this.handleFilterToggle.bind(this)}
      >
        <DropdownToggle
          tag='div'
          className="filter-toggle"
        >
          <span>{T.translate('features.EntityListView.Header.filterBy')}</span>
          <span className="fa fa-angle-down float-xs-right"></span>
        </DropdownToggle>
        <DropdownMenu onClick={e => e.stopPropagation()}>
          {
            this.state.filterOptions.map((option) => {
              return (
                <DropdownItem
                  key={option.id}
                >
                  <div className="form-check">
                    <label
                      className="form-check-label"
                      onClick={e => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={this.state.activeFilter.indexOf(option.id) !== -1}
                        onChange={this.props.onFilterClick.bind(this, option)}
                      />
                      {option.displayName}
                    </label>
                  </div>
                </DropdownItem>
              );
            })
          }
        </DropdownMenu>
      </Dropdown>
    );

    let pageList = [];
    for (let pageIndex = 1; pageIndex < this.state.numberOfPages+1; pageIndex++) {
      pageList.push(pageIndex);
    }

    return (
      <div>
        {/*
          <div className="entity-list-header">
            <div className="search-box">
              <div className="form-group input-group">
                <label className="control-label sr-only">
                  {T.translate('features.EntityListView.Header.search-placeholder')}
                </label>
                <input
                  disabled={this.props.isSearchDisabled ? 'disabled': null}
                  type="text"
                  className="form-control"
                  placeholder={placeholder}
                  value={this.state.searchText}
                  onChange={this.onSearchChange.bind(this)}
                />
                <span className="input-feedback">
                  <span className="fa fa-search"></span>
                </span>
              </div>
            </div>
            <div className="filter">
              <Tooltip
                placement="top"
                isOpen={this.state.sortDropdownTooltip}
                target={tooltipId}
                toggle={this.toggleSortDropdownTooltip.bind(this)}
                delay={0}
              >
                {T.translate(`features.EntityListView.Header.sortdropdown-tooltip`)}
              </Tooltip>
            </div>
            <div className="view-selector float-xs-right">
              <div className="sort">
              </div>
              <div className="pagination-dropdown">
                <PaginationDropdown
                  numberOfPages={this.state.numberOfPages}
                  currentPage={this.state.currentPage}
                  onPageChange={this.props.onPageChange}
                />
              </div>
            </div>
          </div>
        */}
        <div className="entity-list-header">
          <div className="search-box-2 input-group">
            <span className="input-feedback-2 input-group-addon">
              <span className="fa fa-search"></span>
            </span>
            <input
              type="text"
              className="search-input form-control"
              placeholder={placeholder}
              value={this.state.searchText}
              onChange={this.onSearchChange.bind(this)}
            />
          </div>
          <div className="filter-2">
            {filterDropdown}
          </div>
          <div className="sort-2">
            <span className="sort-label">
              {T.translate('features.EntityListView.Header.sortLabel')}
            </span>
            {sortDropdown}
          </div>
          <div className="pagination-2">
            <span className="total-entities">
              {this.state.numberOfEntities}+ Entities
            </span>
            <ReactPaginate
              pageCount={this.state.numberOfPages}
              pageRangeDisplayed={3}
              marginPagesDisplayed={1}
              breakLabel={<a>...</a>}
              breakClassName={"ellipsis"}
              previousLabel={<span className="fa fa-angle-left"></span>}
              nextLabel={<span className="fa fa-angle-right"></span>}
              onPageChange={this.handlePageChange.bind(this)}
              initialPage={this.state.currentPage-1}
              containerClassName={"page-list"}
              activeClassName={"current-page"}
              pageClassName={"page-index"}
              pageLinkClassName={"page-index-link"}
            />
          </div>
        </div>
      </div>
    );
  }
}

EntityListHeader.propTypes = {
  filterOptions: PropTypes.arrayOf(
    PropTypes.shape({
      displayName : PropTypes.string,
      id: PropTypes.string
    })
  ),
  onFilterClick: PropTypes.func,
  activeFilter: PropTypes.arrayOf(PropTypes.string),
  sortOptions: PropTypes.arrayOf(
    PropTypes.shape({
      displayName : PropTypes.string,
      sort: PropTypes.string,
      order: PropTypes.string,
      fullSort: PropTypes.string
    })
  ),
  activeSort: PropTypes.shape({
    displayName : PropTypes.string,
    sort: PropTypes.string,
    order: PropTypes.string,
    fullSort: PropTypes.string
  }),
  isSortDisabled: PropTypes.bool,
  onSortClick: PropTypes.func,
  onSearch: PropTypes.func,
  isSearchDisabled: PropTypes.bool,
  searchText: PropTypes.string,
  numberOfPages: PropTypes.number,
  numberOfEntities: PropTypes.number,
  currentPage: PropTypes.number,
  onPageChange: PropTypes.func
};
