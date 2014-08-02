/*
 * Copyright 2012-2014 Continuuity, Inc.
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

package com.continuuity.client;

import com.continuuity.client.config.ReactorClientConfig;
import com.continuuity.client.util.RESTClient;
import com.continuuity.common.http.HttpMethod;
import com.continuuity.common.http.HttpResponse;
import com.continuuity.common.http.ObjectResponse;
import com.continuuity.proto.ServiceMeta;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.apache.twill.discovery.Discoverable;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import javax.inject.Inject;

/**
 * Provides ways to interact with Reactor User Services.
 */
public class ServiceClient {

  private final RESTClient restClient;
  private final ReactorClientConfig config;

  @Inject
  public ServiceClient(ReactorClientConfig config) {
    this.config = config;
    this.restClient = RESTClient.create(config);
  }

  /**
   * Gets information about a service.
   * 
   * @param appId ID of the application that the service belongs to
   * @param serviceId ID of the service
   * @return {@link ServiceMeta} representing the service.
   * @throws IOException if a network error occurred
   */
  public ServiceMeta get(String appId, String serviceId) throws IOException {
    URL url = config.resolveURL(String.format("apps/%s/services/%s", appId, serviceId));
    HttpResponse response = restClient.execute(HttpMethod.GET, url);
    return ObjectResponse.fromJsonBody(response, ServiceMeta.class).getResponseObject();
  }

  public List<Discoverable> discover(String appId, String serviceId, final String discoverableId) throws IOException {
    URL url = config.resolveURL(String.format("apps/%s/services/%s/discover/%s", appId, serviceId, discoverableId));
    HttpResponse response = restClient.execute(HttpMethod.GET, url);
    List<Discoverable> discoverables = new ArrayList<Discoverable>();
    JsonParser parser = new JsonParser();
    JsonArray array = (JsonArray) parser.parse(response.getResponseBodyAsString());

    for (JsonElement element: array) {
      final JsonObject object = element.getAsJsonObject();
      discoverables.add(new Discoverable() {
        @Override
        public String getName() {
          return discoverableId;
        }

        @Override
        public InetSocketAddress getSocketAddress() {
          return new InetSocketAddress(object.get("host").getAsString(), object.get("port").getAsInt());
        }
      });
    }
    return discoverables;
  }
}
