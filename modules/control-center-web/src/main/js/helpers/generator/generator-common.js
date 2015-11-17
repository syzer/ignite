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

// Entry point for common functions for code generation.
$generatorCommon = {};

// Add leading zero.
$generatorCommon.addLeadingZero = function (numberStr, minSize) {
    if (typeof (numberStr) != 'string')
        numberStr = '' + numberStr;

    while (numberStr.length < minSize) {
        numberStr = '0' + numberStr;
    }

    return numberStr;
};

// Format date to string.
$generatorCommon.formatDate = function (date) {
    var dd = $generatorCommon.addLeadingZero(date.getDate(), 2);
    var mm = $generatorCommon.addLeadingZero(date.getMonth() + 1, 2);

    var yyyy = date.getFullYear();

    return mm + '/' + dd + '/' + yyyy + ' ' + $generatorCommon.addLeadingZero(date.getHours(), 2) + ':' + $generatorCommon.addLeadingZero(date.getMinutes(), 2);
};

// Generate comment for generated XML, Java, ... files.
$generatorCommon.mainComment = function mainComment() {
    return 'This configuration was generated by Ignite Web Console (' + $generatorCommon.formatDate(new Date()) + ')';
};

// Create result holder with service functions and properties for XML and java code generation.
$generatorCommon.builder = function (deep) {
    var res = [];

    res.deep = deep || 0;
    res.needEmptyLine = false;
    res.lineStart = true;
    res.datasources = [];
    res.imports = {};
    res.vars = {};

    res.safeDeep = 0;
    res.safeNeedEmptyLine = false;
    res.safeImports = {};
    res.safeDatasources = [];
    res.safePoint = -1;

    res.startSafeBlock = function () {
        res.safeDeep = this.deep;
        this.safeNeedEmptyLine = this.needEmptyLine;
        this.safeImports = _.cloneDeep(this.imports);
        this.safeDatasources = this.datasources.slice();
        this.safePoint = this.length;
    };

    res.rollbackSafeBlock = function () {
        if (this.safePoint >= 0) {
            this.splice(this.safePoint, this.length - this.safePoint);

            this.deep = res.safeDeep;
            this.needEmptyLine = this.safeNeedEmptyLine;
            this.datasources = this.safeDatasources;
            this.imports = this.safeImports;
            this.safePoint = -1;
        }
    };

    res.asString = function() {
      return this.join('\n');
    };

    res.append = function (s) {
        this.push((this.lineStart ? _.repeat('    ', this.deep) : '') + s);

        return this;
    };

    res.line = function (s) {
        if (s) {
            if (this.needEmptyLine)
                this.push('');

            this.append(s);
        }

        this.needEmptyLine = false;

        this.lineStart = true;

        return this;
    };

    res.startBlock = function (s) {
        if (s) {
            if (this.needEmptyLine)
                this.push('');

            this.append(s);
        }

        this.needEmptyLine = false;

        this.lineStart = true;

        this.deep++;

        return this;
    };

    res.endBlock = function (s) {
        this.deep--;

        if (s)
            this.append(s);

        this.lineStart = true;

        return this;
    };

    res.emptyLineIfNeeded = function () {
        if (this.needEmptyLine) {
            this.push('');
            this.lineStart = true;

            this.needEmptyLine = false;
        }
    };

    /**
     * Add class to imports.
     *
     * @param clsName Full class name.
     * @returns {String} Short class name or full class name in case of names conflict.
     */
    res.importClass = function (clsName) {
        var fullClassName = $dataStructures.fullClassName(clsName);

        var dotIdx = fullClassName.lastIndexOf('.');

        var shortName = dotIdx > 0 ? fullClassName.substr(dotIdx + 1) : fullClassName;

        if (this.imports[shortName]) {
            if (this.imports[shortName] != fullClassName)
                return fullClassName; // Short class names conflict. Return full name.
        }
        else
            this.imports[shortName] = fullClassName;

        return shortName;
    };

    /**
     * @returns String with "java imports" section.
     */
    res.generateImports = function () {
        var res = [];

        for (var clsName in this.imports) {
            if (this.imports.hasOwnProperty(clsName) && this.imports[clsName].lastIndexOf('java.lang.', 0) != 0)
                res.push('import ' + this.imports[clsName] + ';');
        }

        res.sort();

        return res.join('\n')
    };

    return res;
};

// Eviction policies code generation descriptors.
$generatorCommon.EVICTION_POLICIES = {
    LRU: {
        className: 'org.apache.ignite.cache.eviction.lru.LruEvictionPolicy',
        fields: {batchSize: null, maxMemorySize: null, maxSize: null}
    },
    FIFO: {
        className: 'org.apache.ignite.cache.eviction.fifo.FifoEvictionPolicy',
        fields: {batchSize: null, maxMemorySize: null, maxSize: null}
    },
    SORTED: {
        className: 'org.apache.ignite.cache.eviction.sorted.SortedEvictionPolicy',
        fields: {batchSize: null, maxMemorySize: null, maxSize: null}
    }
};

// Marshaller code generation descriptors.
$generatorCommon.MARSHALLERS = {
    OptimizedMarshaller: {
        className: 'org.apache.ignite.marshaller.optimized.OptimizedMarshaller',
        fields: {poolSize: null, requireSerializable: null }
    },
    JdkMarshaller: {
        className: 'org.apache.ignite.marshaller.jdk.JdkMarshaller',
        fields: {}
    }
};

// Pairs of supported databases and their JDBC dialects.
$generatorCommon.JDBC_DIALECTS = {
    Generic: 'org.apache.ignite.cache.store.jdbc.dialect.BasicJdbcDialect',
    Oracle: 'org.apache.ignite.cache.store.jdbc.dialect.OracleDialect',
    DB2: 'org.apache.ignite.cache.store.jdbc.dialect.DB2Dialect',
    SQLServer: 'org.apache.ignite.cache.store.jdbc.dialect.SQLServerDialect',
    MySQL: 'org.apache.ignite.cache.store.jdbc.dialect.MySQLDialect',
    PostgreSQL: 'org.apache.ignite.cache.store.jdbc.dialect.BasicJdbcDialect',
    H2: 'org.apache.ignite.cache.store.jdbc.dialect.H2Dialect'
};

// Return JDBC dialect full class name for specified database.
$generatorCommon.jdbcDialectClassName = function(db) {
    var dialectClsName = $generatorCommon.JDBC_DIALECTS[db];

    return dialectClsName ? dialectClsName : 'Unknown database: ' + db;
};

// Generate default data cache for specified igfs instance.
$generatorCommon.igfsDataCache = function(igfs) {
    return {
        name: igfs.name + '-data',
        cacheMode: 'PARTITIONED',
        atomicityMode: 'TRANSACTIONAL',
        writeSynchronizationMode: 'FULL_SYNC',
        backups: 0,
        igfsAffinnityGroupSize: igfs.affinnityGroupSize || 512
    };
};

// Generate default meta cache for specified igfs instance.
$generatorCommon.igfsMetaCache = function(igfs) {
    return {
        name: igfs.name + '-meta',
        cacheMode: 'REPLICATED',
        atomicityMode: 'TRANSACTIONAL',
        writeSynchronizationMode: 'FULL_SYNC'
    };
};

// Pairs of supported databases and their data sources.
$generatorCommon.DATA_SOURCES = {
    Generic: 'com.mchange.v2.c3p0.ComboPooledDataSource',
    Oracle: 'oracle.jdbc.pool.OracleDataSource',
    DB2: 'com.ibm.db2.jcc.DB2DataSource',
    SQLServer: 'com.microsoft.sqlserver.jdbc.SQLServerDataSource',
    MySQL: 'com.mysql.jdbc.jdbc2.optional.MysqlDataSource',
    PostgreSQL: 'org.postgresql.ds.PGPoolingDataSource',
    H2: 'org.h2.jdbcx.JdbcDataSource'
};

// Return data source full class name for specified database.
$generatorCommon.dataSourceClassName = function(db) {
    var dsClsName = $generatorCommon.DATA_SOURCES[db];

    return dsClsName ? dsClsName : 'Unknown database: ' + db;
};

// Store factories code generation descriptors.
$generatorCommon.STORE_FACTORIES = {
    CacheJdbcPojoStoreFactory: {
        className: 'org.apache.ignite.cache.store.jdbc.CacheJdbcPojoStoreFactory',
        fields: {
            configuration: {type: 'bean'}
        }
    },
    CacheJdbcBlobStoreFactory: {
        className: 'org.apache.ignite.cache.store.jdbc.CacheJdbcBlobStoreFactory',
        fields: {
            user: null,
            dataSourceBean: null,
            initSchema: null,
            createTableQuery: null,
            loadQuery: null,
            insertQuery: null,
            updateQuery: null,
            deleteQuery: null
        }
    },
    CacheHibernateBlobStoreFactory: {
        className: 'org.apache.ignite.cache.store.hibernate.CacheHibernateBlobStoreFactory',
        fields: {hibernateProperties: {type: 'propertiesAsList', propVarName: 'props'}}
    }
};

// Swap space SPI code generation descriptor.
$generatorCommon.SWAP_SPACE_SPI = {
    className: 'org.apache.ignite.spi.swapspace.file.FileSwapSpaceSpi',
    fields: {
        baseDirectory: {type: 'path'},
        readStripesNumber: null,
        maximumSparsity: {type: 'float'},
        maxWriteQueueSize: null,
        writeBufferSize: null
    }
};

// Transaction configuration code generation descriptor.
$generatorCommon.TRANSACTION_CONFIGURATION = {
    className: 'org.apache.ignite.configuration.TransactionConfiguration',
    fields: {
        defaultTxConcurrency: {type: 'enum', enumClass: 'org.apache.ignite.transactions.TransactionConcurrency'},
        transactionIsolation: {
            type: 'org.apache.ignite.transactions.TransactionIsolation',
            setterName: 'defaultTxIsolation'
        },
        defaultTxTimeout: null,
        pessimisticTxLogLinger: null,
        pessimisticTxLogSize: null,
        txSerializableEnabled: null,
        txManagerLookupClassName: null
    }
};

// SSL configuration code generation descriptor.
$generatorCommon.SSL_CONFIGURATION_TRUST_FILE_FACTORY = {
    className: 'org.apache.ignite.ssl.SslContextFactory',
    fields: {
        keyAlgorithm: null,
        keyStoreFilePath: {type: 'path'},
        keyStorePassword: {type: 'raw'},
        keyStoreType: null,
        protocol: null,
        trustStoreFilePath: {type: 'path'},
        trustStorePassword: {type: 'raw'},
        trustStoreType: null
    }
};

// SSL configuration code generation descriptor.
$generatorCommon.SSL_CONFIGURATION_TRUST_MANAGER_FACTORY = {
    className: 'org.apache.ignite.ssl.SslContextFactory',
    fields: {
        keyAlgorithm: null,
        keyStoreFilePath: {type: 'path'},
        keyStorePassword: {type: 'raw'},
        keyStoreType: null,
        protocol: null,
        trustManagers: {type: 'array'}
    }
};

// Communication configuration code generation descriptor.
$generatorCommon.CONNECTOR_CONFIGURATION = {
    className: 'org.apache.ignite.configuration.ConnectorConfiguration',
    fields: {
        jettyPath: null,
        host: null,
        port: {dflt: 11211},
        portRange: {dflt: 100},
        idleTimeout: {dflt: 7000},
        receiveBufferSize: {dflt: 32768},
        sendBufferSize: {dflt: 32768},
        sendQueueLimit: {dflt: 0},
        directBuffer: {dflt: false},
        noDelay: {dflt: false},
        selectorCount: null,
        threadPoolSize: null,
        messageInterceptor: {type: 'bean'},
        secretKey: null,
        sslEnabled: {dflt: false}
    }
};

// Communication configuration code generation descriptor.
$generatorCommon.COMMUNICATION_CONFIGURATION = {
    className: 'org.apache.ignite.spi.communication.tcp.TcpCommunicationSpi',
    fields: {
        listener: {type: 'bean'},
        localAddress: null,
        localPort: {dflt: 47100},
        localPortRange: {dflt: 100},
        sharedMemoryPort: {dflt: 48100},
        directBuffer: {dflt: false},
        directSendBuffer: {dflt: false},
        idleConnectionTimeout: {dflt: 30000},
        connectTimeout: {dflt: 5000},
        maxConnectTimeout: {dflt: 600000},
        reconnectCount: {dflt: 10},
        socketSendBuffer: {dflt: 32768},
        socketReceiveBuffer: {dflt: 32768},
        messageQueueLimit: {dflt: 1024},
        slowClientQueueLimit: null,
        tcpNoDelay: {dflt: true},
        ackSendThreshold: {dflt: 16},
        unacknowledgedMessagesBufferSize: {dflt: 0},
        socketWriteTimeout: {dflt: 2000},
        selectorsCount: null,
        addressResolver: {type: 'bean'}
    }
};

// Communication configuration code generation descriptor.
$generatorCommon.IGFS_IPC_CONFIGURATION = {
    className: 'org.apache.ignite.igfs.IgfsIpcEndpointConfiguration',
    fields: {
        type: {type: 'enum', enumClass: 'org.apache.ignite.igfs.IgfsIpcEndpointType'},
        host: {dflt: '127.0.0.1'},
        port: {dflt: 10500},
        memorySize: {dflt: 262144},
        tokenDirectoryPath: {dflt: 'ipc/shmem'}
    }
};
