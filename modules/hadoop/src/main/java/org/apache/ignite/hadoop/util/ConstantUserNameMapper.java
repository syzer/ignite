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

import org.apache.ignite.internal.util.typedef.internal.S;
import org.jetbrains.annotations.Nullable;

/**
 * Constant user name mapper. Performs all file system requests with the same user name.
 * <p>
 * If {@code null} is set as a name, name of the current process owner will be used.
 */
public class ConstantUserNameMapper implements UserNameMapper {
    /** */
    private static final long serialVersionUID = 0L;

    /** User name. */
    private String usrName;

    /** {@inheritDoc} */
    @Nullable @Override public String map(String name) {
        return usrName;
    }

    /**
     * Get user name to be user for all file system requests.
     * <p>
     * When set to {@code null}, name of the current process owner will be used.
     *
     * @return User name.
     */
    public String getUserName() {
        return usrName;
    }

    /**
     * Set user name. See {@link #getUserName()} for more information.
     *
     * @param usrName User name.
     */
    public void setUserName(@Nullable String usrName) {
        this.usrName = usrName;
    }

    /** {@inheritDoc} */
    @Override public String toString() {
        return S.toString(ConstantUserNameMapper.class, this);
    }
}
