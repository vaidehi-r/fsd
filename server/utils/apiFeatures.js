/**
 * API Features utility class for query filtering, sorting, field selection, and pagination.
 * Designed to work with Mongoose queries.
 */
class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  /**
   * Filter by query parameters.
   * Supports MongoDB comparison operators: gte, gt, lte, lt
   */
  filter() {
    const queryObj = { ...this.queryStr };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search', 'keyword'];
    excludedFields.forEach((field) => delete queryObj[field]);

    // Add $ prefix to comparison operators
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    this.query = this.query.find(JSON.parse(queryString));
    return this;
  }

  /**
   * Text search by keyword across indexed text fields.
   */
  search() {
    if (this.queryStr.keyword) {
      const keyword = {
        $or: [
          { title: { $regex: this.queryStr.keyword, $options: 'i' } },
          { brand: { $regex: this.queryStr.keyword, $options: 'i' } },
          { model: { $regex: this.queryStr.keyword, $options: 'i' } },
          { location: { $regex: this.queryStr.keyword, $options: 'i' } },
        ],
      };
      this.query = this.query.find(keyword);
    }
    return this;
  }

  /**
   * Sort results. Default: newest first.
   * Supports: price_asc, price_desc, rating, newest
   */
  sort() {
    if (this.queryStr.sort) {
      switch (this.queryStr.sort) {
        case 'price_asc':
          this.query = this.query.sort({ pricePerDay: 1 });
          break;
        case 'price_desc':
          this.query = this.query.sort({ pricePerDay: -1 });
          break;
        case 'rating':
          this.query = this.query.sort({ averageRating: -1 });
          break;
        case 'newest':
        default:
          this.query = this.query.sort({ createdAt: -1 });
          break;
      }
    } else {
      this.query = this.query.sort({ createdAt: -1 });
    }
    return this;
  }

  /**
   * Field limiting — select specific fields.
   */
  limitFields() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    }
    return this;
  }

  /**
   * Pagination with page and limit.
   * Returns pagination metadata for the response.
   */
  paginate() {
    const page = parseInt(this.queryStr.page, 10) || 1;
    const limit = parseInt(this.queryStr.limit, 10) || 12;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    this.pagination = { page, limit };
    return this;
  }
}

export default ApiFeatures;
