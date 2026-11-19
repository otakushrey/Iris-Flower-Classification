import matplotlib
matplotlib.use('Agg')

import io
import base64
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import seaborn as sns
from sklearn.datasets import load_iris
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from mpl_toolkits.mplot3d import Axes3D  # noqa: F401


PALETTE = ['#6366f1', '#ec4899', '#10b981']
CLASS_NAMES = ['Setosa', 'Versicolor', 'Virginica']


def _fig_to_base64(fig):
    """Convert a matplotlib figure to a base64-encoded PNG string."""
    buf = io.BytesIO()
    fig.savefig(buf, format='png', bbox_inches='tight', facecolor=fig.get_facecolor())
    buf.seek(0)
    encoded = base64.b64encode(buf.read()).decode('utf-8')
    buf.close()
    plt.close(fig)
    return encoded


def _load_iris_df():
    """Load the iris dataset as a DataFrame with a 'species' column."""
    iris = load_iris()
    df = pd.DataFrame(iris.data, columns=[
        'Sepal Length', 'Sepal Width', 'Petal Length', 'Petal Width'
    ])
    df['species'] = [CLASS_NAMES[t] for t in iris.target]
    df['target'] = iris.target
    return df, iris


class IrisAnalysis:
    """EDA and PCA analysis for the Iris dataset."""

    def __init__(self):
        self.df, self.iris = _load_iris_df()
        self._pca_cache = None

    # ------------------------------------------------------------------
    # Dataset info (not a chart)
    # ------------------------------------------------------------------

    def get_dataset_info(self):
        """Return a dict with basic dataset statistics."""
        df = self.df.drop(columns=['target'])
        numeric_df = df.drop(columns=['species'])
        return {
            'shape': list(self.df.shape),
            'dtypes': {col: str(dtype) for col, dtype in df.dtypes.items()},
            'describe': numeric_df.describe().to_dict(),
            'class_distribution': df['species'].value_counts().to_dict(),
        }

    # ------------------------------------------------------------------
    # EDA charts
    # ------------------------------------------------------------------

    def get_correlation_heatmap(self):
        """Seaborn heatmap of feature correlations."""
        plt.style.use('dark_background')
        numeric_df = self.df[['Sepal Length', 'Sepal Width', 'Petal Length', 'Petal Width']]
        corr = numeric_df.corr()

        fig, ax = plt.subplots(figsize=(8, 6))
        fig.patch.set_facecolor('#1a1a2e')
        ax.set_facecolor('#1a1a2e')

        sns.heatmap(
            corr,
            annot=True,
            fmt='.2f',
            cmap='coolwarm',
            ax=ax,
            linewidths=0.5,
            linecolor='#333',
            cbar=True,
        )
        ax.set_title('Feature Correlation Heatmap', color='white', fontsize=14, pad=12)
        plt.tight_layout()
        return _fig_to_base64(fig)

    def get_pairplot(self):
        """Seaborn pairplot coloured by species."""
        # Use dark rcParams so the pairplot background is dark
        with plt.rc_context({
            'axes.facecolor': '#1a1a2e',
            'figure.facecolor': '#16213e',
            'axes.edgecolor': '#444',
            'xtick.color': 'white',
            'ytick.color': 'white',
            'text.color': 'white',
            'axes.labelcolor': 'white',
        }):
            plot_df = self.df.drop(columns=['target'])
            palette_dict = {cls: col for cls, col in zip(CLASS_NAMES, PALETTE)}
            g = sns.pairplot(
                plot_df,
                hue='species',
                palette=palette_dict,
                diag_kind='kde',
                plot_kws={'alpha': 0.7},
            )
            g.fig.suptitle('Iris Pairplot', color='white', y=1.02, fontsize=14)

            buf = io.BytesIO()
            g.fig.savefig(buf, format='png', bbox_inches='tight',
                          facecolor='#16213e')
            buf.seek(0)
            encoded = base64.b64encode(buf.read()).decode('utf-8')
            buf.close()
            plt.close(g.fig)
        return encoded

    def get_distribution_plots(self):
        """2×2 violin plots for each feature by species."""
        plt.style.use('dark_background')
        features = ['Sepal Length', 'Sepal Width', 'Petal Length', 'Petal Width']

        fig, axes = plt.subplots(2, 2, figsize=(12, 9))
        fig.patch.set_facecolor('#1a1a2e')
        fig.suptitle('Feature Distributions by Species (Violin)', color='white',
                     fontsize=15, y=1.01)

        palette_dict = {cls: col for cls, col in zip(CLASS_NAMES, PALETTE)}
        plot_df = self.df.drop(columns=['target'])

        for ax, feat in zip(axes.flatten(), features):
            ax.set_facecolor('#16213e')
            sns.violinplot(
                data=plot_df, x='species', y=feat,
                palette=palette_dict, ax=ax, inner='box'
            )
            ax.set_title(feat, color='white', fontsize=11)
            ax.tick_params(colors='white')
            ax.xaxis.label.set_color('white')
            ax.yaxis.label.set_color('white')
            for spine in ax.spines.values():
                spine.set_edgecolor('#444')

        plt.tight_layout()
        return _fig_to_base64(fig)

    def get_boxplots(self):
        """2×2 box plots for each feature by species."""
        plt.style.use('dark_background')
        features = ['Sepal Length', 'Sepal Width', 'Petal Length', 'Petal Width']

        fig, axes = plt.subplots(2, 2, figsize=(12, 9))
        fig.patch.set_facecolor('#1a1a2e')
        fig.suptitle('Feature Box Plots by Species', color='white',
                     fontsize=15, y=1.01)

        palette_dict = {cls: col for cls, col in zip(CLASS_NAMES, PALETTE)}
        plot_df = self.df.drop(columns=['target'])

        for ax, feat in zip(axes.flatten(), features):
            ax.set_facecolor('#16213e')
            sns.boxplot(
                data=plot_df, x='species', y=feat,
                palette=palette_dict, ax=ax
            )
            ax.set_title(feat, color='white', fontsize=11)
            ax.tick_params(colors='white')
            ax.xaxis.label.set_color('white')
            ax.yaxis.label.set_color('white')
            for spine in ax.spines.values():
                spine.set_edgecolor('#444')

        plt.tight_layout()
        return _fig_to_base64(fig)

    # ------------------------------------------------------------------
    # PCA helpers
    # ------------------------------------------------------------------

    def _get_pca_data(self):
        """Compute (and cache) PCA on all 4 components."""
        if self._pca_cache is not None:
            return self._pca_cache

        X = self.iris.data
        y = self.iris.target
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        pca_full = PCA(n_components=4)
        X_pca_full = pca_full.fit_transform(X_scaled)

        self._pca_cache = {
            'X_scaled': X_scaled,
            'X_pca_full': X_pca_full,
            'pca_full': pca_full,
            'y': y,
            'feature_names': ['Sepal Length', 'Sepal Width', 'Petal Length', 'Petal Width'],
        }
        return self._pca_cache

    def get_pca_2d(self):
        """PCA 2D scatter coloured by class."""
        plt.style.use('dark_background')
        cache = self._get_pca_data()
        X_2d = cache['X_pca_full'][:, :2]
        y = cache['y']
        ev = cache['pca_full'].explained_variance_ratio_

        fig, ax = plt.subplots(figsize=(9, 7))
        fig.patch.set_facecolor('#1a1a2e')
        ax.set_facecolor('#16213e')

        for cls_idx, (cls_name, color) in enumerate(zip(CLASS_NAMES, PALETTE)):
            mask = y == cls_idx
            ax.scatter(X_2d[mask, 0], X_2d[mask, 1],
                       c=color, label=cls_name, alpha=0.8, edgecolors='white',
                       linewidths=0.4, s=70)

        ax.set_xlabel(f'PC1 ({ev[0]*100:.1f}% variance)', color='white')
        ax.set_ylabel(f'PC2 ({ev[1]*100:.1f}% variance)', color='white')
        ax.set_title('PCA — 2D Projection', color='white', fontsize=14)
        ax.tick_params(colors='white')
        for spine in ax.spines.values():
            spine.set_edgecolor('#444')
        legend = ax.legend(facecolor='#1a1a2e', edgecolor='#444', labelcolor='white')
        plt.tight_layout()
        return _fig_to_base64(fig)

    def get_pca_3d(self):
        """PCA 3D scatter using mpl_toolkits.mplot3d."""
        plt.style.use('dark_background')
        cache = self._get_pca_data()
        X_3d = cache['X_pca_full'][:, :3]
        y = cache['y']
        ev = cache['pca_full'].explained_variance_ratio_

        fig = plt.figure(figsize=(10, 8))
        fig.patch.set_facecolor('#1a1a2e')
        ax = fig.add_subplot(111, projection='3d')
        ax.set_facecolor('#16213e')

        for cls_idx, (cls_name, color) in enumerate(zip(CLASS_NAMES, PALETTE)):
            mask = y == cls_idx
            ax.scatter(X_3d[mask, 0], X_3d[mask, 1], X_3d[mask, 2],
                       c=color, label=cls_name, alpha=0.8, s=60,
                       edgecolors='white', linewidths=0.3)

        ax.set_xlabel(f'PC1 ({ev[0]*100:.1f}%)', color='white', labelpad=8)
        ax.set_ylabel(f'PC2 ({ev[1]*100:.1f}%)', color='white', labelpad=8)
        ax.set_zlabel(f'PC3 ({ev[2]*100:.1f}%)', color='white', labelpad=8)
        ax.set_title('PCA — 3D Projection', color='white', fontsize=14)
        ax.tick_params(colors='white')
        ax.xaxis.pane.fill = False
        ax.yaxis.pane.fill = False
        ax.zaxis.pane.fill = False
        ax.xaxis.pane.set_edgecolor('#444')
        ax.yaxis.pane.set_edgecolor('#444')
        ax.zaxis.pane.set_edgecolor('#444')
        legend = ax.legend(facecolor='#1a1a2e', edgecolor='#444', labelcolor='white')
        plt.tight_layout()
        return _fig_to_base64(fig)

    def get_scree_plot(self):
        """Bar chart of explained variance ratio + cumulative line."""
        plt.style.use('dark_background')
        cache = self._get_pca_data()
        ev = cache['pca_full'].explained_variance_ratio_
        cum_ev = np.cumsum(ev)
        components = [f'PC{i+1}' for i in range(len(ev))]

        fig, ax = plt.subplots(figsize=(8, 6))
        fig.patch.set_facecolor('#1a1a2e')
        ax.set_facecolor('#16213e')

        bars = ax.bar(components, ev * 100, color=PALETTE[0], alpha=0.85,
                      edgecolor='white', linewidth=0.5)
        ax2 = ax.twinx()
        ax2.plot(components, cum_ev * 100, color=PALETTE[2], marker='o',
                 linewidth=2, label='Cumulative')
        ax2.set_ylabel('Cumulative Explained Variance (%)', color='white')
        ax2.tick_params(colors='white')
        ax2.set_ylim(0, 110)

        ax.set_xlabel('Principal Component', color='white')
        ax.set_ylabel('Explained Variance (%)', color='white')
        ax.set_title('PCA Scree Plot', color='white', fontsize=14)
        ax.tick_params(colors='white')
        for spine in ax.spines.values():
            spine.set_edgecolor('#444')

        # Annotate bars
        for bar, val in zip(bars, ev * 100):
            ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.5,
                    f'{val:.1f}%', ha='center', va='bottom', color='white', fontsize=10)

        ax2.legend(loc='center right', facecolor='#1a1a2e', edgecolor='#444',
                   labelcolor='white')
        plt.tight_layout()
        return _fig_to_base64(fig)

    def get_pca_loadings(self):
        """Heatmap of PCA component loadings (feature contributions)."""
        plt.style.use('dark_background')
        cache = self._get_pca_data()
        pca = cache['pca_full']
        feature_names = cache['feature_names']
        component_names = [f'PC{i+1}' for i in range(4)]

        loadings = pd.DataFrame(
            pca.components_,
            columns=feature_names,
            index=component_names
        )

        fig, ax = plt.subplots(figsize=(9, 5))
        fig.patch.set_facecolor('#1a1a2e')
        ax.set_facecolor('#1a1a2e')

        sns.heatmap(
            loadings,
            annot=True,
            fmt='.3f',
            cmap='RdBu_r',
            center=0,
            ax=ax,
            linewidths=0.5,
            linecolor='#333',
            cbar=True,
        )
        ax.set_title('PCA Component Loadings', color='white', fontsize=14, pad=12)
        ax.tick_params(colors='white')
        plt.tight_layout()
        return _fig_to_base64(fig)

    def get_explained_variance(self):
        """Return list of explained variance ratios for all 4 components."""
        cache = self._get_pca_data()
        return cache['pca_full'].explained_variance_ratio_.tolist()
