import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import './AdminForm.css';
import { ArrowLeft, Save, Upload, Loader, X, Image as ImageIcon, Plus, Trash2, Package } from 'lucide-react';

const AdminProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        title: '',
        type: 'cabinet',
        category_id: '',
        description: '',
        is_active: 1,
        spec: {
            wood_species: '',
            door_style: '',
            box_construction: '',
            drawer_glide: '',
            drawer_head: '',
            drawer_construction: '',
            hinge: '',
            cabinet_interior: '',
            cabinet_exterior: ''
        }
    });

    const [variantGroups, setVariantGroups] = useState([{
        name: 'General',
        image: null,
        imagePreview: null,
        existingImage: null,
        variants: [{
            sku: '',
            variant_name: '',
            width: '',
            height: '',
            depth: '',
            regular_price: '',
            collaborator_price: '',
            stock_quantity: 0,
            is_active: 1
        }]
    }]);

    const [files, setFiles] = useState({
        thumbnail: null,
        images: []
    });

    const [previews, setPreviews] = useState({
        thumbnail: null,
        images: []
    });

    const [existingImages, setExistingImages] = useState({
        thumbnail: null,
        images: []
    });

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCategories();
        if (isEditMode) {
            fetchProduct();
        }
    }, [id, isEditMode]);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            const allCategories = response.data.data || response.data || [];
            setCategories(allCategories.filter(cat => cat.type === 'product'));
        } catch (err) {
            console.error("Failed to fetch categories", err);
        }
    };

    const fetchProduct = async () => {
        try {
            const response = await api.get(`/products/${id}`);
            const product = response.data.data || response.data;

            // Handle spec being either a JSON string or an object
            let parsedSpec = product.spec;
            if (typeof parsedSpec === 'string') {
                try {
                    parsedSpec = JSON.parse(parsedSpec);
                } catch (e) {
                    console.error("Failed to parse spec JSON", e);
                    parsedSpec = {};
                }
            }

            setFormData({
                title: product.title || '',
                type: product.type || 'cabinet',
                category_id: product.category?.id || product.category_id || '',
                description: product.description || '',
                is_active: product.is_active ? 1 : 0,
                spec: {
                    wood_species: parsedSpec?.wood_species || '',
                    door_style: parsedSpec?.door_style || '',
                    box_construction: parsedSpec?.box_construction || '',
                    drawer_glide: parsedSpec?.drawer_glide || '',
                    drawer_head: parsedSpec?.drawer_head || '',
                    drawer_construction: parsedSpec?.drawer_construction || '',
                    hinge: parsedSpec?.hinge || '',
                    cabinet_interior: parsedSpec?.cabinet_interior || '',
                    cabinet_exterior: parsedSpec?.cabinet_exterior || ''
                }
            });

            // Load variants with groups
            const groupedVariants = product.grouped_variants || [];
            if (groupedVariants.length > 0) {
                setVariantGroups(groupedVariants.map(g => ({
                    name: g.group_name || 'General',
                    image: null,
                    imagePreview: null,
                    existingImage: g.architect_image || null,
                    variants: g.variants.map(v => ({
                        id: v.id,
                        sku: v.sku || '',
                        variant_name: v.variant_name || '',
                        width: v.dimensions?.width || v.width || '',
                        height: v.dimensions?.height || v.height || '',
                        depth: v.dimensions?.depth || v.depth || '',
                        regular_price: v.regular_price || '',
                        collaborator_price: v.collaborator_price || '',
                        stock_quantity: v.stock_quantity || 0,
                        is_active: v.is_active ? 1 : 0
                    }))
                })));
            } else if (product.variants?.length > 0) {
                // Fallback for non-grouped products
                setVariantGroups([{
                    name: 'General',
                    image: null,
                    imagePreview: null,
                    existingImage: null,
                    variants: product.variants.map(v => ({
                        id: v.id,
                        sku: v.sku || '',
                        variant_name: v.variant_name || '',
                        width: v.width || '',
                        height: v.height || '',
                        depth: v.depth || '',
                        regular_price: v.regular_price || '',
                        collaborator_price: v.collaborator_price || '',
                        stock_quantity: v.stock_quantity || 0,
                        is_active: v.is_active ? 1 : 0
                    }))
                }]);
            }

            // Load existing images
            setExistingImages({
                thumbnail: product.thumbnail || null,
                images: product.images?.map(img => img.image_path || img) || []
            });

        } catch (err) {
            console.error("Failed to fetch product", err);
            setError("Failed to load product details.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
        }));
    };

    const handleSpecChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            spec: { ...prev.spec, [name]: value }
        }));
    };

    const handleVariantChange = (groupIndex, variantIndex, field, value) => {
        const newGroups = [...variantGroups];
        newGroups[groupIndex].variants[variantIndex][field] = value;
        setVariantGroups(newGroups);
    };

    const addVariant = (groupIndex) => {
        const newGroups = [...variantGroups];
        newGroups[groupIndex].variants.push({
            sku: '',
            variant_name: '',
            width: '',
            height: '',
            depth: '',
            regular_price: '',
            collaborator_price: '',
            stock_quantity: 0,
            is_active: 1
        });
        setVariantGroups(newGroups);
    };

    const removeVariant = (groupIndex, variantIndex) => {
        const newGroups = [...variantGroups];
        if (newGroups[groupIndex].variants.length === 1 && newGroups.length === 1) {
            alert('Product must have at least one variant');
            return;
        }
        newGroups[groupIndex].variants = newGroups[groupIndex].variants.filter((_, i) => i !== variantIndex);
        setVariantGroups(newGroups);
    };

    const addGroup = () => {
        setVariantGroups([...variantGroups, {
            name: '',
            image: null,
            imagePreview: null,
            existingImage: null,
            variants: [{
                sku: '',
                variant_name: '',
                width: '',
                height: '',
                depth: '',
                regular_price: '',
                collaborator_price: '',
                stock_quantity: 0,
                is_active: 1
            }]
        }]);
    };

    const removeGroup = (groupIndex) => {
        if (variantGroups.length === 1) {
            alert('Product must have at least one group');
            return;
        }
        setVariantGroups(variantGroups.filter((_, i) => i !== groupIndex));
    };

    const handleGroupNameChange = (groupIndex, value) => {
        const newGroups = [...variantGroups];
        newGroups[groupIndex].name = value;
        setVariantGroups(newGroups);
    };

    const handleGroupImageChange = (e, groupIndex) => {
        const file = e.target.files[0];
        if (!file) return;

        const newGroups = [...variantGroups];
        newGroups[groupIndex].image = file;

        const reader = new FileReader();
        reader.onloadend = () => {
            newGroups[groupIndex].imagePreview = reader.result;
            setVariantGroups([...newGroups]);
        };
        reader.readAsDataURL(file);
    };

    const handleFileChange = (e, fieldName) => {
        const selectedFiles = e.target.files;
        if (!selectedFiles || selectedFiles.length === 0) return;

        if (fieldName === 'images') {
            const newFiles = Array.from(selectedFiles);
            setFiles(prev => ({ ...prev, images: [...prev.images, ...newFiles] }));

            newFiles.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviews(prev => ({ ...prev, images: [...prev.images, reader.result] }));
                };
                reader.readAsDataURL(file);
            });
        } else {
            const file = selectedFiles[0];
            setFiles(prev => ({ ...prev, [fieldName]: file }));

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviews(prev => ({ ...prev, [fieldName]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const removeNewImage = (fieldName, index = null) => {
        if (fieldName === 'images' && index !== null) {
            setFiles(prev => ({
                ...prev,
                images: prev.images.filter((_, i) => i !== index)
            }));
            setPreviews(prev => ({
                ...prev,
                images: prev.images.filter((_, i) => i !== index)
            }));
        } else {
            setFiles(prev => ({ ...prev, [fieldName]: null }));
            setPreviews(prev => ({ ...prev, [fieldName]: null }));
        }
    };

    const removeExistingImage = (type, index = null) => {
        if (type === 'images' && index !== null) {
            setExistingImages(prev => ({
                ...prev,
                images: prev.images.filter((_, i) => i !== index)
            }));
        } else {
            setExistingImages(prev => ({ ...prev, [type]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const data = new FormData();

        // Basic fields
        data.append('title', formData.title);
        data.append('type', formData.type);
        data.append('is_active', formData.is_active);
        if (formData.category_id) data.append('category_id', formData.category_id);
        if (formData.description) data.append('description', formData.description);

        // Product-level pricing from first variant (Fallback for listing)
        const firstVariant = variantGroups[0]?.variants[0];
        if (firstVariant && firstVariant.regular_price) {
            data.append('regular_price', firstVariant.regular_price);
            data.append('collaborator_price', firstVariant.collaborator_price || firstVariant.regular_price);
        }

        // Specifications as an array (associative)
        Object.keys(formData.spec).forEach(key => {
            if (formData.spec[key] !== undefined && formData.spec[key] !== null) {
                data.append(`spec[${key}]`, formData.spec[key]);
            }
        });

        // Flatten variants for submission
        const flatVariants = variantGroups.flatMap(group =>
            group.variants.map(v => ({ ...v, variant_group: group.name }))
        );

        // Variants as an array (FormData index format)
        flatVariants.forEach((variant, index) => {
            Object.keys(variant).forEach(key => {
                if (variant[key] !== undefined && variant[key] !== null && variant[key] !== '') {
                    data.append(`variants[${index}][${key}]`, variant[key]);
                }
            });
        });

        // Group Details (Images and Names) - Required by backend for mapping
        variantGroups.forEach((group, index) => {
            data.append(`group_details[${index}][group_name]`, group.name);
            if (group.image) {
                data.append(`group_details[${index}][architect_image]`, group.image);
            } else if (group.existingImage) {
                // If it's an update and no new image, we might need to signify the existing one
                // Backend usually keeps existing if no new file is sent for that index, 
                // but we send the group_name to ensure the mapping stays correct.
            }
        });

        // Debug: Log all entries being sent
        console.log('--- FormData Payload ---');
        for (let pair of data.entries()) {
            console.log(pair[0], pair[1]);
        }
        console.log('------------------------');

        // New files
        if (files.thumbnail) {
            data.append('thumbnail', files.thumbnail);
        }

        files.images.forEach(file => {
            data.append('images[]', file);
        });

        // Method spoofing for updates with multipart/form-data
        if (isEditMode) {
            data.append('_method', 'PUT');
        }

        try {
            const url = isEditMode ? `/products/${id}` : '/products';
            // Always use POST for multipart/form-data + method spoofing for Laravel compatibility
            await api.post(url, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            navigate('/admin/products');
        } catch (err) {
            console.error("Failed to save product", err);
            const errorMsg = err.response?.data?.message || "Failed to save product.";
            const errorDetails = err.response?.data?.errors ? JSON.stringify(err.response.data.errors, null, 2) : '';
            setError(errorDetails ? `${errorMsg}\n${errorDetails}` : errorMsg);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="admin-loading-state">
            <Loader className="spin" /> Loading Product...
        </div>
    );

    return (
        <div className="admin-page fade-in">
            <div className="admin-header">
                <div className="header-left">
                    <button onClick={() => navigate('/admin/products')} className="back-btn">
                        <ArrowLeft size={20} />
                    </button>
                    <h1>{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
                </div>
            </div>

            <div className="admin-form-wrapper">
                {error && <div className="error-message"><pre>{error}</pre></div>}

                <form onSubmit={handleSubmit} className="admin-form-modern">
                    {/* Basic Information Card */}
                    <div className="form-card">
                        <h3 className="card-title">Basic Information</h3>
                        <div className="form-grid-2">
                            <div className="form-group">
                                <label>Product Title*</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Shaker Origami White"
                                    required
                                    className="modern-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Product Type*</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    required
                                    className="modern-select"
                                >
                                    <option value="cabinet">Cabinet</option>
                                    <option value="door">Door</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={handleChange}
                                    className="modern-select"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.title || cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label modern-checkbox">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={formData.is_active === 1}
                                        onChange={handleChange}
                                    />
                                    <span>Product is Active</span>
                                </label>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Premium shaker style cabinet with origami white finish..."
                                className="modern-textarea"
                            ></textarea>
                        </div>
                    </div>

                    {/* Product Images Card */}
                    <div className="form-card">
                        <h3 className="card-title">Product Images</h3>

                        <div className="image-upload-grid">
                            {/* Thumbnail */}
                            <div className="image-upload-section">
                                <label className="upload-label">Thumbnail Image</label>
                                <input
                                    type="file"
                                    id="thumbnail-upload"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'thumbnail')}
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="thumbnail-upload" className="upload-box">
                                    {previews.thumbnail || existingImages.thumbnail ? (
                                        <div className="image-preview-box">
                                            <img src={previews.thumbnail || existingImages.thumbnail} alt="Thumbnail" />
                                            <button
                                                type="button"
                                                className="remove-img-btn"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (previews.thumbnail) removeNewImage('thumbnail');
                                                    else removeExistingImage('thumbnail');
                                                }}
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="upload-placeholder">
                                            <ImageIcon size={32} />
                                            <span>Click to upload thumbnail</span>
                                        </div>
                                    )}
                                </label>
                            </div>


                        </div>

                        {/* Gallery Images */}
                        <div className="admin-gallery-section">
                            <label className="upload-label">Gallery Images</label>
                            <div className="admin-gallery-grid">
                                {/* Existing images */}
                                {existingImages.images.map((img, idx) => (
                                    <div key={`existing-${idx}`} className="admin-gallery-item">
                                        <img src={img} alt={`Gallery ${idx + 1}`} />
                                        <button
                                            type="button"
                                            className="remove-img-btn"
                                            onClick={() => removeExistingImage('images', idx)}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}

                                {/* New images */}
                                {previews.images.map((img, idx) => (
                                    <div key={`new-${idx}`} className="admin-gallery-item">
                                        <img src={img} alt={`New ${idx + 1}`} />
                                        <button
                                            type="button"
                                            className="remove-img-btn"
                                            onClick={() => removeNewImage('images', idx)}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}

                                {/* Upload button */}
                                <div className="admin-gallery-item">
                                    <input
                                        type="file"
                                        id="gallery-upload"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => handleFileChange(e, 'images')}
                                        style={{ display: 'none' }}
                                    />
                                    <label htmlFor="gallery-upload" className="admin-gallery-upload-btn">
                                        <Plus size={24} />
                                        <span>Add Images</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Specifications Card */}
                    <div className="form-card">
                        <h3 className="card-title">Technical Specifications</h3>
                        <div className="form-grid-3">
                            <div className="form-group">
                                <label>Wood Species</label>
                                <input
                                    type="text"
                                    name="wood_species"
                                    value={formData.spec.wood_species}
                                    onChange={handleSpecChange}
                                    placeholder="e.g. Birch"
                                    className="modern-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Door Style</label>
                                <input
                                    type="text"
                                    name="door_style"
                                    value={formData.spec.door_style}
                                    onChange={handleSpecChange}
                                    placeholder="e.g. Full Overlay"
                                    className="modern-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Box Construction</label>
                                <input
                                    type="text"
                                    name="box_construction"
                                    value={formData.spec.box_construction}
                                    onChange={handleSpecChange}
                                    placeholder="e.g. 3/4 inch Plywood"
                                    className="modern-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Drawer Glide</label>
                                <input
                                    type="text"
                                    name="drawer_glide"
                                    value={formData.spec.drawer_glide}
                                    onChange={handleSpecChange}
                                    placeholder="e.g. Soft-close"
                                    className="modern-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Drawer Head</label>
                                <input
                                    type="text"
                                    name="drawer_head"
                                    value={formData.spec.drawer_head}
                                    onChange={handleSpecChange}
                                    placeholder="e.g. 5-Piece"
                                    className="modern-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Drawer Construction</label>
                                <input
                                    type="text"
                                    name="drawer_construction"
                                    value={formData.spec.drawer_construction}
                                    onChange={handleSpecChange}
                                    placeholder="e.g. Dovetail"
                                    className="modern-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Hinge</label>
                                <input
                                    type="text"
                                    name="hinge"
                                    value={formData.spec.hinge}
                                    onChange={handleSpecChange}
                                    placeholder="e.g. Concealed European"
                                    className="modern-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Cabinet Interior</label>
                                <input
                                    type="text"
                                    name="cabinet_interior"
                                    value={formData.spec.cabinet_interior}
                                    onChange={handleSpecChange}
                                    placeholder="e.g. Natural"
                                    className="modern-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Cabinet Exterior</label>
                                <input
                                    type="text"
                                    name="cabinet_exterior"
                                    value={formData.spec.cabinet_exterior}
                                    onChange={handleSpecChange}
                                    placeholder="e.g. Painted White"
                                    className="modern-input"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Product Variants Card */}
                    <div className="form-card">
                        <div className="card-header-with-action">
                            <h3 className="card-title">Product Variant Groups</h3>
                            <button type="button" onClick={addGroup} className="btn-add-variant" style={{ background: '#000' }}>
                                <Plus size={18} /> Add New Group
                            </button>
                        </div>

                        <div className="variants-container">
                            {variantGroups.map((group, gIndex) => (
                                <div key={gIndex} className="variant-group-box" style={{
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    padding: '20px',
                                    marginBottom: '30px',
                                    background: '#f9f9f9'
                                }}>
                                    <div className="group-header" style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '20px',
                                        paddingBottom: '15px',
                                        borderBottom: '1px dashed #ccc'
                                    }}>
                                        <div style={{ flex: 1, marginRight: '20px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Group Name* (e.g. Full Height Base)</label>
                                            <input
                                                type="text"
                                                value={group.name}
                                                onChange={(e) => handleGroupNameChange(gIndex, e.target.value)}
                                                placeholder="Enter group name..."
                                                className="modern-input"
                                                required
                                            />
                                        </div>

                                        <div style={{ width: '250px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Group Architect Image</label>
                                            <div className="group-image-upload" style={{ position: 'relative' }}>
                                                <input
                                                    type="file"
                                                    id={`group-img-${gIndex}`}
                                                    accept="image/*"
                                                    onChange={(e) => handleGroupImageChange(e, gIndex)}
                                                    style={{ display: 'none' }}
                                                />
                                                <label htmlFor={`group-img-${gIndex}`} className="upload-box small" style={{
                                                    height: '100px',
                                                    border: '2px dashed #bbb',
                                                    borderRadius: '4px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    background: '#fff',
                                                    overflow: 'hidden'
                                                }}>
                                                    {group.imagePreview || group.existingImage ? (
                                                        <img src={group.imagePreview || group.existingImage} alt="Group" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                                                    ) : (
                                                        <div style={{ textAlign: 'center', color: '#888' }}>
                                                            <ImageIcon size={20} />
                                                            <div style={{ fontSize: '10px' }}>Upload Plan</div>
                                                        </div>
                                                    )}
                                                </label>
                                                {(group.imagePreview || group.existingImage) && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newGroups = [...variantGroups];
                                                            newGroups[gIndex].image = null;
                                                            newGroups[gIndex].imagePreview = null;
                                                            newGroups[gIndex].existingImage = null;
                                                            setVariantGroups(newGroups);
                                                        }}
                                                        style={{
                                                            position: 'absolute',
                                                            top: '-10px',
                                                            right: '-10px',
                                                            background: '#ff4444',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '50%',
                                                            width: '20px',
                                                            height: '20px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                            zIndex: 10
                                                        }}
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => removeGroup(gIndex)}
                                            className="btn-remove-variant"
                                            style={{ marginLeft: '15px', color: '#ff4444' }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <div className="group-variants-list" style={{ paddingLeft: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                            <h5 style={{ margin: 0, color: '#666' }}>Variants in this group</h5>
                                            <button type="button" onClick={() => addVariant(gIndex)} className="btn-add-variant" style={{ padding: '5px 10px', fontSize: '12px' }}>
                                                <Plus size={14} /> Add Size Row
                                            </button>
                                        </div>

                                        {group.variants.map((variant, vIndex) => (
                                            <div key={vIndex} className="variant-card-modern" style={{ background: '#fff', marginBottom: '15px' }}>
                                                <div className="variant-header">
                                                    <h4>Size #{vIndex + 1}</h4>
                                                    {(group.variants.length > 1 || variantGroups.length > 1) && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeVariant(gIndex, vIndex)}
                                                            className="btn-remove-variant"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="form-grid-2">
                                                    <div className="form-group">
                                                        <label>SKU*</label>
                                                        <input
                                                            type="text"
                                                            value={variant.sku}
                                                            onChange={(e) => handleVariantChange(gIndex, vIndex, 'sku', e.target.value)}
                                                            placeholder="e.g. SA_V09FH"
                                                            required
                                                            className="modern-input"
                                                        />
                                                    </div>

                                                    <div className="form-group">
                                                        <label>Variant Name* (Dimensions)</label>
                                                        <input
                                                            type="text"
                                                            value={variant.variant_name}
                                                            onChange={(e) => handleVariantChange(gIndex, vIndex, 'variant_name', e.target.value)}
                                                            placeholder='e.g. 9"W×34-1/2"H×24"D'
                                                            required
                                                            className="modern-input"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="form-grid-3">
                                                    <div className="form-group">
                                                        <label>Width (in)*</label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={variant.width}
                                                            onChange={(e) => handleVariantChange(gIndex, vIndex, 'width', e.target.value)}
                                                            required
                                                            className="modern-input"
                                                        />
                                                    </div>

                                                    <div className="form-group">
                                                        <label>Height (in)*</label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={variant.height}
                                                            onChange={(e) => handleVariantChange(gIndex, vIndex, 'height', e.target.value)}
                                                            required
                                                            className="modern-input"
                                                        />
                                                    </div>

                                                    <div className="form-group">
                                                        <label>Depth (in)*</label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={variant.depth}
                                                            onChange={(e) => handleVariantChange(gIndex, vIndex, 'depth', e.target.value)}
                                                            required
                                                            className="modern-input"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="form-grid-2">
                                                    <div className="form-group">
                                                        <label>Regular Price ($)*</label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={variant.regular_price}
                                                            onChange={(e) => handleVariantChange(gIndex, vIndex, 'regular_price', e.target.value)}
                                                            required
                                                            className="modern-input"
                                                        />
                                                    </div>

                                                    <div className="form-group">
                                                        <label>Collab Price ($)*</label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={variant.collaborator_price}
                                                            onChange={(e) => handleVariantChange(gIndex, vIndex, 'collaborator_price', e.target.value)}
                                                            required
                                                            className="modern-input"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="form-actions-sticky">
                        <button type="submit" className="btn-primary-large" disabled={saving}>
                            {saving ? (
                                <><Loader size={20} className="spin" /> Saving...</>
                            ) : (
                                <><Save size={20} /> {isEditMode ? 'Update Product' : 'Create Product'}</>
                            )}
                        </button>
                        <button
                            type="button"
                            className="btn-secondary-large"
                            onClick={() => navigate('/admin/products')}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminProductForm;
