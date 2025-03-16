package com.iiitn.resell.search.api;

import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import com.iiitn.resell.search.domain.ProductDocument;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Full-text + faceted search over the products index. Falls back to a
 * match_all when the user doesn't supply a query string.
 */
@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final ElasticsearchOperations es;

    @GetMapping("/products")
    public ResponseEntity<Map<String, Object>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String condition,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false, defaultValue = "false") boolean includeSold,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Query query = Query.of(b -> b.bool(bool -> {
            if (q != null && !q.isBlank()) {
                bool.must(m -> m.multiMatch(mm -> mm
                        .query(q)
                        .fields("title^3", "description", "category", "location")));
            } else {
                bool.must(m -> m.matchAll(ma -> ma));
            }
            if (category != null)  bool.filter(f -> f.term(t -> t.field("category").value(category)));
            if (condition != null) bool.filter(f -> f.term(t -> t.field("condition").value(condition)));
            if (!includeSold)      bool.filter(f -> f.term(t -> t.field("sold").value(false)));
            if (minPrice != null)  bool.filter(f -> f.range(r -> r.field("price").gte(co.elastic.clients.json.JsonData.of(minPrice))));
            if (maxPrice != null)  bool.filter(f -> f.range(r -> r.field("price").lte(co.elastic.clients.json.JsonData.of(maxPrice))));
            return bool;
        }));

        NativeQuery nq = NativeQuery.builder()
                .withQuery(query)
                .withPageable(PageRequest.of(page, size))
                .build();

        SearchHits<ProductDocument> hits = es.search(nq, ProductDocument.class);
        List<ProductDocument> docs = hits.stream().map(SearchHit::getContent).toList();
        return ResponseEntity.ok(Map.of(
                "total", hits.getTotalHits(),
                "page", page,
                "size", size,
                "results", docs));
    }
}
