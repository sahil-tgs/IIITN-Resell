package com.iiitn.resell.analytics.api;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Read-only reporting endpoints — these are the kind of OLAP queries that
 * justify having a warehouse separate from OLTP. Each query is a tight SQL
 * aggregation across fact + dim tables, the canonical star-schema pattern.
 */
@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final JdbcTemplate jdbc;

    @GetMapping("/top-categories")
    public ResponseEntity<List<Map<String, Object>>> topCategories(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(jdbc.queryForList("""
            SELECT c.category, COUNT(*) AS listings
            FROM analytics.fact_listing f
            JOIN analytics.dim_category c ON c.category_key = f.category_key
            GROUP BY c.category
            ORDER BY listings DESC
            LIMIT ?
        """, limit));
    }

    @GetMapping("/daily-listings")
    public ResponseEntity<List<Map<String, Object>>> dailyListings(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(jdbc.queryForList("""
            SELECT d.full_date AS date, COUNT(*) AS listings, COALESCE(SUM(f.listed_price), 0) AS gmv
            FROM analytics.fact_listing f
            JOIN analytics.dim_date d ON d.date_key = f.date_key
            WHERE d.full_date >= CURRENT_DATE - ? * INTERVAL '1 day'
            GROUP BY d.full_date
            ORDER BY d.full_date
        """, days));
    }

    @GetMapping("/top-sellers")
    public ResponseEntity<List<Map<String, Object>>> topSellers(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(jdbc.queryForList("""
            SELECT u.username, COUNT(*) AS sales, COALESCE(SUM(s.sale_price), 0) AS revenue
            FROM analytics.fact_sale s
            JOIN analytics.dim_user u ON u.user_key = s.seller_key
            GROUP BY u.username
            ORDER BY revenue DESC
            LIMIT ?
        """, limit));
    }

    @GetMapping("/conversion-funnel")
    public ResponseEntity<Map<String, Object>> funnel() {
        Long listings = jdbc.queryForObject("SELECT COUNT(*) FROM analytics.fact_listing", Long.class);
        Long sales    = jdbc.queryForObject("SELECT COUNT(*) FROM analytics.fact_sale", Long.class);
        Long messages = jdbc.queryForObject("SELECT COUNT(*) FROM analytics.fact_message", Long.class);
        double rate = (listings == null || listings == 0 || sales == null) ? 0.0 : (sales * 100.0 / listings);
        return ResponseEntity.ok(Map.of(
                "listings", listings,
                "messages", messages,
                "sales", sales,
                "sellThroughRatePct", Math.round(rate * 100) / 100.0));
    }
}
