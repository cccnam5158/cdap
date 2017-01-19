/*
 * Copyright © 2017 Cask Data, Inc.
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

package co.cask.cdap.metrics.collect;

import co.cask.cdap.api.messaging.TopicNotFoundException;
import co.cask.cdap.api.metrics.MetricValues;
import co.cask.cdap.common.conf.Constants;
import co.cask.cdap.common.io.BinaryEncoder;
import co.cask.cdap.common.io.Encoder;
import co.cask.cdap.internal.io.DatumWriter;
import co.cask.cdap.messaging.MessagingService;
import co.cask.cdap.messaging.client.StoreRequestBuilder;
import co.cask.cdap.proto.id.NamespaceId;
import co.cask.cdap.proto.id.TopicId;
import com.google.inject.Inject;
import com.google.inject.Singleton;
import com.google.inject.name.Named;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Iterator;

/**
 * A {@link AggregatedMetricsCollectionService} that uses TMS to publish {@link co.cask.cdap.api.metrics.MetricValues}.
 */
@Singleton
public class MessagingMetricsCollectionService extends AggregatedMetricsCollectionService {

  private final MessagingService messagingService;
  private final TopicId[] metricsTopics;
  private final int partitionSize;
  private final DatumWriter<MetricValues> recordWriter;
  private final ByteArrayOutputStream encoderOutputStream;
  private final Encoder encoder;

  @Inject
  public MessagingMetricsCollectionService(@Named(Constants.Metrics.TOPIC_PREFIX) String topicPrefix,
                                           @Named(Constants.Metrics.MESSAGING_PARTITION_NUM) int partitionSize,
                                           MessagingService messagingService, DatumWriter<MetricValues> recordWriter) {
    super();
    this.messagingService = messagingService;

    this.recordWriter = recordWriter;

    // Parent guarantees the publish method would not get called concurrently, hence safe to reuse the same instances.
    this.encoderOutputStream = new ByteArrayOutputStream(1024);
    this.encoder = new BinaryEncoder(encoderOutputStream);
    this.metricsTopics = new TopicId[partitionSize];
    for (int i = 0; i < partitionSize; i++) {
      this.metricsTopics[i] = NamespaceId.SYSTEM.topic(topicPrefix + "_" + i);
    }
    this.partitionSize = partitionSize;
  }

  @Override
  protected void publish(Iterator<MetricValues> metrics) throws Exception {
    encoderOutputStream.reset();
    while (metrics.hasNext()) {
      // Encode each MetricRecord into bytes and make it an individual message in a message set.
      publishMetric(metrics.next());
    }
  }

  private void publishMetric(MetricValues value) throws IOException, TopicNotFoundException {
    recordWriter.encode(value, encoder);
    // TODO better partitioning
    int partition = value.hashCode() % this.partitionSize;
    messagingService.publish(StoreRequestBuilder.of(metricsTopics[partition])
                               .addPayloads(encoderOutputStream.toByteArray()).build());
    encoderOutputStream.reset();
  }
}