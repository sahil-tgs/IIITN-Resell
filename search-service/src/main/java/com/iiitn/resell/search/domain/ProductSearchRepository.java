package com.iiitn.resell.search.domain;

import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

public interface ProductSearchRepository extends ElasticsearchRepository<ProductDocument, String> {
}
