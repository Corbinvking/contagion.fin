class Node {
    constructor(point, axis) {
        this.point = point;
        this.left = null;
        this.right = null;
        this.axis = axis;
    }
}

export class KDTree {
    constructor(points) {
        this.root = this.buildTree(points, 0);
    }

    buildTree(points, depth) {
        if (points.length === 0) return null;

        const axis = depth % 2;  // 0 for latitude, 1 for longitude
        const coordinate = axis === 0 ? 'lat' : 'lng';

        // Sort points by current axis
        points.sort((a, b) => a[coordinate] - b[coordinate]);

        const medianIndex = Math.floor(points.length / 2);
        const medianPoint = points[medianIndex];

        const node = new Node(medianPoint, axis);
        node.left = this.buildTree(points.slice(0, medianIndex), depth + 1);
        node.right = this.buildTree(points.slice(medianIndex + 1), depth + 1);

        return node;
    }

    findNearestNeighbor(targetPoint) {
        let best = { point: null, distance: Infinity };
        this._searchNearest(this.root, targetPoint, best);
        return best.point;
    }

    findKNearestNeighbors(targetPoint, k) {
        const neighbors = [];
        this._searchKNearest(this.root, targetPoint, k, neighbors);
        return neighbors.sort((a, b) => a.distance - b.distance)
            .slice(0, k)
            .map(n => n.point);
    }

    _searchNearest(node, targetPoint, best) {
        if (!node) return;

        const distance = this.calculateDistance(targetPoint, node.point);
        if (distance < best.distance) {
            best.point = node.point;
            best.distance = distance;
        }

        const coordinate = node.axis === 0 ? 'lat' : 'lng';
        const axisDiff = targetPoint[coordinate] - node.point[coordinate];

        // Recursively search the closer subtree
        const firstHalf = axisDiff < 0 ? node.left : node.right;
        const secondHalf = axisDiff < 0 ? node.right : node.left;

        this._searchNearest(firstHalf, targetPoint, best);

        // Check if we need to search the other subtree
        if (Math.abs(axisDiff) < best.distance) {
            this._searchNearest(secondHalf, targetPoint, best);
        }
    }

    _searchKNearest(node, targetPoint, k, neighbors) {
        if (!node) return;

        const distance = this.calculateDistance(targetPoint, node.point);
        this._insertIntoKNearest(neighbors, { point: node.point, distance }, k);

        const coordinate = node.axis === 0 ? 'lat' : 'lng';
        const axisDiff = targetPoint[coordinate] - node.point[coordinate];

        const firstHalf = axisDiff < 0 ? node.left : node.right;
        const secondHalf = axisDiff < 0 ? node.right : node.left;

        this._searchKNearest(firstHalf, targetPoint, k, neighbors);

        // Check if we need to search the other subtree
        const maxDistance = neighbors.length < k ? Infinity : neighbors[neighbors.length - 1].distance;
        if (Math.abs(axisDiff) < maxDistance) {
            this._searchKNearest(secondHalf, targetPoint, k, neighbors);
        }
    }

    _insertIntoKNearest(neighbors, item, k) {
        const index = neighbors.findIndex(n => n.distance > item.distance);
        if (index === -1) {
            if (neighbors.length < k) {
                neighbors.push(item);
            }
        } else {
            neighbors.splice(index, 0, item);
            if (neighbors.length > k) {
                neighbors.pop();
            }
        }
    }

    calculateDistance(point1, point2) {
        const R = 6371; // Earth's radius in km
        const lat1 = this.toRadians(point1.lat);
        const lat2 = this.toRadians(point2.lat);
        const dLat = this.toRadians(point2.lat - point1.lat);
        const dLng = this.toRadians(point2.lng - point1.lng);

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
} 