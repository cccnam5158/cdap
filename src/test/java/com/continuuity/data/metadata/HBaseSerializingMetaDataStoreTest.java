package com.continuuity.data.metadata;

import org.junit.BeforeClass;

public class HBaseSerializingMetaDataStoreTest extends
    HBaseMetaDataStoreTest {

  @BeforeClass
  public static void setupMDS() throws Exception {
    mds = new SerializingMetaDataStore(opex);
  }

}
