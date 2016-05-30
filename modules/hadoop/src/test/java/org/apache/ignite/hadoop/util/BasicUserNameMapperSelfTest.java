/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.apache.ignite.hadoop.util;

import org.apache.avro.reflect.Nullable;
import org.apache.ignite.IgniteException;
import org.apache.ignite.testframework.GridTestUtils;
import org.apache.ignite.testframework.junits.common.GridCommonAbstractTest;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Callable;

/**
 * Test for basic user name mapper.
 */
public class BasicUserNameMapperSelfTest extends GridCommonAbstractTest {
    /**
     * Test mapper with null mappings.
     *
     * @throws Exception If failed.
     */
    @SuppressWarnings("ThrowableResultOfMethodCallIgnored")
    public void testNullMappings() throws Exception {
        GridTestUtils.assertThrows(null, new Callable<Void>() {
            @Override public Void call() throws Exception {
                create(null, null);

                return null;
            }
        }, IgniteException.class, null);

        GridTestUtils.assertThrows(null, new Callable<Void>() {
            @Override public Void call() throws Exception {
                create(null, "A");

                return null;
            }
        }, IgniteException.class, null);
    }

    /**
     * Test empty mappings.
     *
     * @throws Exception If failed.
     */
    public void testEmptyMappings() throws Exception {
        Map<String, String> map = new HashMap<>();

        BasicUserNameMapper mapper = create(map, null);

        assertNull(mapper.map(null));
        assertNull(mapper.map(""));
        assertNull(mapper.map("1"));
        assertNull(mapper.map("2"));

        mapper = create(map, "A");

        assertEquals("A", mapper.map(null));
        assertEquals("A", mapper.map(""));
        assertEquals("A", mapper.map("1"));
        assertEquals("A", mapper.map("2"));
    }

    /**
     * Test regular mappings.
     *
     * @throws Exception If failed.
     */
    public void testMappings() throws Exception {
        Map<String, String> map = new HashMap<>();

        map.put("1", "101");

        BasicUserNameMapper mapper = create(map, null);

        assertNull(mapper.map(null));
        assertNull(mapper.map(""));
        assertEquals("101", mapper.map("1"));
        assertNull(mapper.map("2"));

        mapper = create(map, "A");

        assertEquals("A", mapper.map(null));
        assertEquals("A", mapper.map(""));
        assertEquals("101", mapper.map("1"));
        assertEquals("A", mapper.map("2"));
    }

    /**
     * Create mapper.
     *
     * @param dictionary Dictionary.
     * @param dfltUsrName Default user name.
     * @return Mapper.
     */
    private BasicUserNameMapper create(@Nullable Map<String, String> dictionary, @Nullable String dfltUsrName) {
        BasicUserNameMapper mapper = new BasicUserNameMapper();

        mapper.setMappings(dictionary);
        mapper.setDefaultUserName(dfltUsrName);

        mapper.start();

        return mapper;
    }
}
