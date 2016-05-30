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

import org.apache.ignite.IgniteException;
import org.apache.ignite.internal.util.typedef.internal.S;
import org.apache.ignite.lifecycle.LifecycleAware;
import org.jetbrains.annotations.Nullable;

import java.util.Map;

/**
 * Name mapper which maps one user name to another based on predefined dictionary.
 */
public class BasicUserNameMapper implements UserNameMapper, LifecycleAware {
    /** */
    private static final long serialVersionUID = 0L;

    /** Mappings. */
    private Map<String, String> mappings;

    /** Default user name. */
    private String dfltUsrName;

    /** {@inheritDoc} */
    @Nullable @Override public String map(String name) {
        assert mappings != null;

        String res = mappings.get(name);

        return res != null ? res : dfltUsrName;
    }

    /** {@inheritDoc} */
    @Override public void start() throws IgniteException {
        if (mappings == null)
            throw new IgniteException("Mappings cannot be null.");
    }

    /** {@inheritDoc} */
    @Override public void stop() throws IgniteException {
        // No-op.
    }

    /**
     * Get mappings.
     *
     * @return Mappings.
     */
    public Map<String, String> getMappings() {
        return mappings;
    }

    /**
     * Set mappings.
     *
     * @param mappings Mappings.
     */
    public void setMappings(Map<String, String> mappings) {
        this.mappings = mappings;
    }

    /**
     * Get default user name (optional).
     * <p>
     * This user name will be used if provided mappings doesn't contain mapping for the given user name.
     * <p>
     * Defaults to {@code null}.
     *
     * @return Default user name.
     */
    @Nullable public String getDefaultUserName() {
        return dfltUsrName;
    }

    /**
     * Set default user name (optional). See {@link #getDefaultUserName()} for more information.
     *
     * @param dfltUsrName Default user name.
     */
    public void setDefaultUserName(@Nullable String dfltUsrName) {
        this.dfltUsrName = dfltUsrName;
    }

    /** {@inheritDoc} */
    @Override public String toString() {
        return S.toString(BasicUserNameMapper.class, this);
    }
}
